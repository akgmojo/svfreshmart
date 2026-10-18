import jwt from 'jsonwebtoken';
import { Customer, DeliveryAddress } from '../types';
import { getCustomerByPhone, saveCustomer } from '../data/db';

const JWT_SECRET = process.env.JWT_SECRET || 'svfreshmart_secure_jwt_secret_2026';

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
   * Add or update customer delivery address
   */
  static saveAddress(phoneNumber: string, addressData: Omit<DeliveryAddress, 'id' | 'customerId'>): Customer {
    const customer = this.getOrCreateCustomer(phoneNumber);
    const newAddress: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      customerId: customer.id,
      ...addressData,
      isDefault: customer.addresses.length === 0 || addressData.isDefault
    };

    if (newAddress.isDefault) {
      customer.addresses.forEach(a => { a.isDefault = false; });
    }

    customer.addresses.push(newAddress);
    return saveCustomer(customer);
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
  static verifyToken(token: string): { id: string; phone: string; name: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; phone: string; name: string };
      return decoded;
    } catch {
      return null;
    }
  }
}
