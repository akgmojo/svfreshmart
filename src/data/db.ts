import fs from 'fs';
import path from 'path';
import { 
  Product, 
  ProductVariation, 
  Order, 
  Customer, 
  BangaloreDeliveryZone, 
  AuditLog,
  AdminUser,
  WebhookEventRecord,
  DeliveryAddress
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_DELIVERY_ZONES } from './initialData';

export interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  zones: BangaloreDeliveryZone[];
  auditLogs: AuditLog[];
  admins: AdminUser[];
  webhookEvents: WebhookEventRecord[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'svfreshmart_db.json');

export const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'admin-super',
    username: 'admin',
    name: 'SV Super Admin',
    role: 'Super Admin',
    passwordHash: '$2b$10$DLNTKw3XcgIttMXEXp8THeCKjUfHosVK84pMWx5JfuMYpRTPiaNGe', // admin@SVFresh2026!
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'admin-store',
    username: 'store_mgr',
    name: 'Koramangala Store Manager',
    role: 'Store Manager',
    passwordHash: '$2b$10$Vx6ZCa6VKYnzbaWyGr3Gf.rKBba51ifEskh72ERqYxa864GL3c4ei', // manager@SVFresh2026!
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'admin-inventory',
    username: 'inventory_mgr',
    name: 'Central Warehouse Inventory Lead',
    role: 'Inventory Manager',
    passwordHash: '$2b$10$XB4EG/9uShbjWeJRbrGAe.7U1h0v0kt.rOn6qK7hct/ZeISypU8qG', // inventory@SVFresh2026!
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'admin-order',
    username: 'order_mgr',
    name: 'Fulfillment & Dispatch Lead',
    role: 'Order Manager',
    passwordHash: '$2b$10$v.Gq/CsHF9eZRWyxfE6wz.u89wgo/JpHYjv2Sj6aWDcUxnV2KrK6u', // order@SVFresh2026!
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'admin-support',
    username: 'support_user',
    name: 'Customer Support Executive',
    role: 'Support',
    passwordHash: '$2b$10$0N91EWZZ.9gk0kzm6iGuLe/eWVuluxZzkxKXRuY7268FD16AxznV.', // support@SVFresh2026!
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

// Ensure directory exists
function ensureDbFile(): DatabaseSchema {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE_PATH)) {
    const initialDb: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: [],
      customers: [
        {
          id: 'cust-demo',
          phoneNumber: '9876543210',
          name: 'Ramesh Gowda',
          email: 'ramesh.gowda@example.com',
          addresses: [
            {
              id: 'addr-1',
              customerId: 'cust-demo',
              fullName: 'Ramesh Gowda',
              phoneNumber: '9876543210',
              addressLine1: 'Flat 402, Green Glen Layout, Outer Ring Road',
              addressLine2: 'Near Bellandur Flyover',
              landmark: 'Opposite Central Mall',
              city: 'Bangalore',
              pincode: '560102',
              isDefault: true,
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      zones: INITIAL_DELIVERY_ZONES,
      auditLogs: [
        {
          id: 'log-init',
          action: 'SYSTEM_INIT',
          details: 'Initialized SV Freshmart V1 Bangalore Catalogue, Delivery Zones, and Admins',
          actor: 'System',
          timestamp: new Date().toISOString()
        }
      ],
      admins: DEFAULT_ADMINS,
      webhookEvents: []
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(raw);
    let mutated = false;

    if (!Array.isArray(parsed.admins) || parsed.admins.length === 0) {
      parsed.admins = DEFAULT_ADMINS;
      mutated = true;
    }
    if (!Array.isArray(parsed.webhookEvents)) {
      parsed.webhookEvents = [];
      mutated = true;
    }

    if (mutated) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (err) {
    console.error('Failed reading DB file, reinitializing', err);
    const fallbackDb: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: [],
      customers: [],
      zones: INITIAL_DELIVERY_ZONES,
      auditLogs: [],
      admins: DEFAULT_ADMINS,
      webhookEvents: []
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(fallbackDb, null, 2), 'utf-8');
    return fallbackDb;
  }
}

export function getDb(): DatabaseSchema {
  return ensureDbFile();
}

export function saveDb(data: DatabaseSchema): void {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${DB_FILE_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE_PATH);
}

// Product helpers
export function getAllProducts(includeInactive = false): Product[] {
  const db = getDb();
  if (includeInactive) return db.products;
  return db.products.filter(p => p.isActive);
}

export function getProductById(id: string): Product | undefined {
  const db = getDb();
  return db.products.find(p => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  const db = getDb();
  return db.products.find(p => p.slug === slug || p.slug === slug.toLowerCase());
}

export function getProductBySku(productSku: string): Product | undefined {
  const db = getDb();
  return db.products.find(p => p.productSku.toUpperCase() === productSku.toUpperCase());
}

export function findVariationBySku(variantSku: string): { product: Product; variation: ProductVariation } | null {
  const db = getDb();
  for (const product of db.products) {
    const variation = product.variations.find(v => v.variantSku.toUpperCase() === variantSku.toUpperCase());
    if (variation) {
      return { product, variation };
    }
  }
  return null;
}

export function saveProduct(product: Product, actor = 'Admin'): void {
  const db = getDb();
  const index = db.products.findIndex(p => p.id === product.id);
  const now = new Date().toISOString();
  product.updatedAt = now;

  if (index >= 0) {
    db.products[index] = product;
    db.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'PRODUCT_UPDATE',
      details: `Updated product "${product.name}" (${product.productSku})`,
      actor,
      timestamp: now
    });
  } else {
    product.createdAt = now;
    db.products.push(product);
    db.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: 'PRODUCT_CREATE',
      details: `Created product "${product.name}" (${product.productSku})`,
      actor,
      timestamp: now
    });
  }
  saveDb(db);
}

// Order helpers
export function getAllOrders(): Order[] {
  const db = getDb();
  return db.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrderById(orderId: string): Order | undefined {
  const db = getDb();
  return db.orders.find(o => o.id === orderId);
}

export function getOrderByIdAndCustomer(orderId: string, phoneOrId: string): Order | undefined {
  const db = getDb();
  return db.orders.find(o => o.id === orderId && (o.customerPhone === phoneOrId || o.customerId === phoneOrId));
}

export function getOrdersByCustomerPhone(phone: string): Order[] {
  const db = getDb();
  return db.orders
    .filter(o => o.customerPhone === phone)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveOrder(order: Order, actor = 'System'): void {
  const db = getDb();
  const index = db.orders.findIndex(o => o.id === order.id);
  order.updatedAt = new Date().toISOString();
  if (index >= 0) {
    db.orders[index] = order;
  } else {
    db.orders.unshift(order);
  }
  db.auditLogs.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action: 'ORDER_SAVED',
    details: `Order ${order.orderNumber} status set to "${order.status}"`,
    actor,
    timestamp: new Date().toISOString()
  });
  saveDb(db);
}

// Delivery Zones
export function getDeliveryZones(): BangaloreDeliveryZone[] {
  return getDb().zones;
}

export function saveDeliveryZones(zones: BangaloreDeliveryZone[], actor = 'Admin'): void {
  const db = getDb();
  db.zones = zones;
  db.auditLogs.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action: 'ZONES_UPDATE',
    details: `Updated Bangalore delivery zones count: ${zones.length}`,
    actor,
    timestamp: new Date().toISOString()
  });
  saveDb(db);
}

// Customers & Addresses
export function getCustomerByPhone(phone: string): Customer | undefined {
  const db = getDb();
  return db.customers.find(c => c.phoneNumber === phone);
}

export function getCustomerById(customerId: string): Customer | undefined {
  const db = getDb();
  return db.customers.find(c => c.id === customerId);
}

export function saveCustomer(customer: Customer): Customer {
  const db = getDb();
  const index = db.customers.findIndex(c => c.phoneNumber === customer.phoneNumber);
  customer.updatedAt = new Date().toISOString();
  if (index >= 0) {
    db.customers[index] = customer;
  } else {
    customer.createdAt = new Date().toISOString();
    db.customers.push(customer);
  }
  saveDb(db);
  return customer;
}

export function addCustomerAddress(phone: string, address: DeliveryAddress): Customer | null {
  const db = getDb();
  const customer = db.customers.find(c => c.phoneNumber === phone);
  if (!customer) return null;

  if (address.isDefault || customer.addresses.length === 0) {
    customer.addresses.forEach(a => { a.isDefault = false; });
    address.isDefault = true;
  }

  customer.addresses.push(address);
  customer.updatedAt = new Date().toISOString();
  saveDb(db);
  return customer;
}

export function deleteCustomerAddress(phone: string, addressId: string): Customer | null {
  const db = getDb();
  const customer = db.customers.find(c => c.phoneNumber === phone);
  if (!customer) return null;

  customer.addresses = customer.addresses.filter(a => a.id !== addressId);
  if (customer.addresses.length > 0 && !customer.addresses.some(a => a.isDefault)) {
    customer.addresses[0].isDefault = true;
  }
  customer.updatedAt = new Date().toISOString();
  saveDb(db);
  return customer;
}

// Audit Logs
export function getAuditLogs(): AuditLog[] {
  return getDb().auditLogs.slice(0, 50);
}

export function addAuditLog(action: string, details: string, actor = 'Admin'): void {
  const db = getDb();
  db.auditLogs.unshift({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    details,
    actor,
    timestamp: new Date().toISOString()
  });
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
  saveDb(db);
}

// Admin User Helpers
export function getAdminByUsername(username: string): AdminUser | undefined {
  const db = getDb();
  return (db.admins || []).find(a => a.username.toLowerCase() === username.toLowerCase());
}

export function getAdminById(id: string): AdminUser | undefined {
  const db = getDb();
  return (db.admins || []).find(a => a.id === id);
}

export function getAllAdmins(): AdminUser[] {
  return getDb().admins || [];
}

export function saveAdmin(admin: AdminUser): void {
  const db = getDb();
  if (!db.admins) db.admins = [];
  const index = db.admins.findIndex(a => a.id === admin.id || a.username.toLowerCase() === admin.username.toLowerCase());
  if (index >= 0) {
    db.admins[index] = admin;
  } else {
    db.admins.push(admin);
  }
  saveDb(db);
}

// Webhook Idempotency Helpers
export function hasWebhookEventBeenProcessed(eventId: string): boolean {
  const db = getDb();
  if (!db.webhookEvents) return false;
  return db.webhookEvents.some(w => w.eventId === eventId);
}

export function recordWebhookEvent(record: WebhookEventRecord): void {
  const db = getDb();
  if (!db.webhookEvents) db.webhookEvents = [];
  db.webhookEvents.unshift(record);
  if (db.webhookEvents.length > 500) {
    db.webhookEvents = db.webhookEvents.slice(0, 500);
  }
  saveDb(db);
}
