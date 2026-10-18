import fs from 'fs';
import path from 'path';
import { Product, ProductVariation, Order, Customer, BangaloreDeliveryZone, AuditLog } from '../types';
import { INITIAL_PRODUCTS, INITIAL_DELIVERY_ZONES } from './initialData';

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  zones: BangaloreDeliveryZone[];
  auditLogs: AuditLog[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'svfreshmart_db.json');

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
          details: 'Initialized SV Freshmart V1 Bangalore Catalogue and Delivery Zones',
          actor: 'System',
          timestamp: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading DB file, reinitializing', err);
    const fallbackDb: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: [],
      customers: [],
      zones: INITIAL_DELIVERY_ZONES,
      auditLogs: []
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
      id: `log-${Date.now()}`,
      action: 'PRODUCT_UPDATE',
      details: `Updated product "${product.name}" (${product.productSku})`,
      actor,
      timestamp: now
    });
  } else {
    product.createdAt = now;
    db.products.push(product);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
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

export function getOrdersByCustomerPhone(phone: string): Order[] {
  const db = getDb();
  return db.orders.filter(o => o.customerPhone === phone).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    id: `log-${Date.now()}`,
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
    id: `log-${Date.now()}`,
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

// Audit Logs
export function getAuditLogs(): AuditLog[] {
  return getDb().auditLogs.slice(0, 50);
}

export function addAuditLog(action: string, details: string, actor = 'Admin'): void {
  const db = getDb();
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
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
