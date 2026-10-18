export type VariationUnit = 
  | 'g' 
  | 'kg' 
  | 'piece' 
  | 'pieces' 
  | 'ml' 
  | 'L' 
  | 'pack'
  | 'box'
  | 'bundle'
  | 'Pack' 
  | 'Box' 
  | 'Bundle'
  | 'bottle'
  | 'jar';

export interface ProductVariation {
  id: string;
  productId: string;
  variantSku: string;
  quantity: number;
  unit: VariationUnit;
  label: string; // e.g. "250g", "1kg", "1 piece", "500ml"
  price: number; // Selling price in INR
  mrp: number;   // Maximum retail price in INR
  stock: number; // Available inventory
  isActive: boolean;
}

export interface Product {
  id: string;
  productSku: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
  variations: ProductVariation[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'Pending Payment'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  variationId: string;
  variantSku: string;
  quantity: number; // Order quantity (e.g. 2 packs)
  unitLabel: string; // e.g. "250g"
  unitPrice: number;
  subtotal: number;
}

export interface DeliveryAddress {
  id: string;
  customerId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string; // "Bangalore"
  pincode: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "SVF-20261017-001"
  customerId: string;
  customerPhone: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'Razorpay' | 'Cash on Delivery (Simulated)';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveryAddress: DeliveryAddress; // Immutable snapshot
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  addresses: DeliveryAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface BangaloreDeliveryZone {
  pincode: string;
  areaName: string;
  isServiceable: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minOrderValue: number;
  estimatedHours: string;
}

export interface ExcelPriceStockRow {
  productSku: string;
  variantSku: string;
  productName: string;
  quantity: number;
  unit: string;
  sellingPrice: number;
  mrp: number;
  stockQuantity: number;
  stockStatus: string;
  productStatus: string;
  category: string;
  imageUrl?: string;
}

export interface ExcelValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: {
    row: number;
    sku: string;
    field: string;
    message: string;
    critical: boolean;
  }[];
  warnings: {
    row: number;
    sku: string;
    message: string;
    oldValue: number | string;
    newValue: number | string;
  }[];
  previewDiffs: {
    variantSku: string;
    productName: string;
    variantLabel: string;
    oldPrice: number;
    newPrice: number;
    priceDiffPct: number;
    oldMrp: number;
    newMrp: number;
    oldStock: number;
    newStock: number;
    hasPriceWarning: boolean;
  }[];
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  actor: string;
  timestamp: string;
}

// RBAC Roles for Admin Panel
export type AdminRole = 
  | 'Super Admin' 
  | 'Store Manager' 
  | 'Inventory Manager' 
  | 'Order Manager' 
  | 'Support';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  passwordHash: string; // bcrypt hash
  isActive: boolean;
  createdAt: string;
}

export interface WebhookEventRecord {
  id: string;
  eventId: string;
  eventType: string;
  orderId?: string;
  processedAt: string;
}
