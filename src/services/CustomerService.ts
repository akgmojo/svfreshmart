import jwt from 'jsonwebtoken';
import { Customer, DeliveryAddress } from '../types';
import { getCustomerByPhone, saveCustomer, addCustomerAddress, deleteCustomerAddress } from '../data/db';

const JWT_SECRET = process.env.JWT_SECRET || 'svfreshmart_secure_jwt_secret_2026';

export interface CustomerSession {
  id: string;
  phone: string;
  name: string;
}

export class CustomerService {
  /**
   * Find or create customer account by mobile number
   */
  static getOrCreateCustomer(phoneNumber: string, name?: string): Customer {
    const cleaned = phoneNumber.replace(/\D/g, '').slice(-10);
    let customer = getCustomerByPhone(cleaned);

    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        phoneNumber: cleaned,
        name: name || 'Freshmart Customer',
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveCustomer(customer);
    } else if (name && customer.name !== name) {
      customer.name = name;
      saveCustomer(customer);
    }

    return customer;
  }

  /**
   * Add customer delivery address
   */
  static saveAddress(phoneNumber: string, addressData: Omit<DeliveryAddress, 'id' | 'customerId'>): Customer {
    const cleaned = phoneNumber.replace(/\D/g, '').slice(-10);
    const customer = this.getOrCreateCustomer(cleaned);
    const newAddress: DeliveryAddress = {
      id: `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId: customer.id,
      ...addressData,
      isDefault: customer.addresses.length === 0 || !!addressData.isDefault
    };

    const updated = addCustomerAddress(cleaned, newAddress);
    return updated || customer;
  }

  /**
   * Delete customer delivery address
   */
  static removeAddress(phoneNumber: string, addressId: string): Customer | null {
    const cleaned = phoneNumber.replace(/\D/g, '').slice(-10);
    return deleteCustomerAddress(cleaned, addressId);
  }

  /**
   * Generate session JWT token
   */
  static generateToken(customer: Customer): string {
    return jwt.sign(
      {
        id: customer.id,
        phone: customer.phoneNumber,
        name: customer.name
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  }

  /**
   * Verify session JWT token
   */
  static verifyToken(token: string): CustomerSession | null {
    try {
      if (!token) return null;
      const decoded = jwt.verify(token, JWT_SECRET) as CustomerSession;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Extract authenticated customer session from Request (Header or Cookie)
   */
  static getSessionFromRequest(request: Request): CustomerSession | null {
    // 1. Try Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const session = this.verifyToken(token);
      if (session) return session;
    }

    // 2. Try Cookie header
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/svf_customer_token=([^;]+)/);
    if (match && match[1]) {
      const token = decodeURIComponent(match[1].trim());
      const session = this.verifyToken(token);
      if (session) return session;
    }

    return null;
  }
}
