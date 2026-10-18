import { Order, OrderStatus, DeliveryAddress } from '../types';
import { getAllOrders, getOrderById, getOrdersByCustomerPhone, saveOrder } from '../data/db';
import { InventoryService, CartItemCheck } from './InventoryService';
import { PricingService, CartInputItem } from './PricingService';
import { NotificationService } from './NotificationService';

export interface CreateOrderParams {
  customerId: string;
  customerPhone: string;
  customerName: string;
  items: CartInputItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'Razorpay' | 'Cash on Delivery (Simulated)';
  deliveryNotes?: string;
}

export class OrderService {
  /**
   * Create an initial order with server-side pricing and stock validation
   */
  static createOrder(params: CreateOrderParams): { success: boolean; order?: Order; error?: string } {
    // 1. Validate stock availability
    const stockValidation = InventoryService.validateStock(params.items);
    if (!stockValidation.isValid) {
      return {
        success: false,
        error: stockValidation.errors.map(e => e.message).join(' | ')
      };
    }

    // 2. Authoritative server-side price calculation
    const pricing = PricingService.calculateCart(params.items, params.deliveryAddress.pincode);

    if (!pricing.isDeliverable) {
      return { success: false, error: 'The selected delivery pincode is outside our Bangalore service zone.' };
    }

    if (!pricing.minOrderMet) {
      return {
        success: false,
        error: `Minimum order value for ${params.deliveryAddress.pincode} is ₹${pricing.minOrderValue}. Your current subtotal is ₹${pricing.subtotal}.`
      };
    }

    const orderNumber = `SVF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: params.customerId,
      customerPhone: params.customerPhone,
      customerName: params.customerName,
      items: pricing.items,
      subtotal: pricing.subtotal,
      deliveryCharge: pricing.deliveryCharge,
      totalAmount: pricing.totalAmount,
      status: 'Pending Payment',
      paymentMethod: params.paymentMethod,
      paymentStatus: 'Pending',
      deliveryAddress: params.deliveryAddress,
      deliveryNotes: params.deliveryNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveOrder(newOrder, `Customer (${params.customerPhone})`);
    return { success: true, order: newOrder };
  }

  /**
   * Transition order to Confirmed status and deduct inventory
   */
  static confirmPayment(orderId: string, razorpayPaymentId?: string, razorpayOrderId?: string): { success: boolean; order?: Order; error?: string } {
    const order = getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const itemsToDeduct: CartItemCheck[] = order.items.map(i => ({
      variantSku: i.variantSku,
      quantity: i.quantity
    }));

    const deduction = InventoryService.deductStock(itemsToDeduct, `OrderConfirmation (${order.orderNumber})`);
    if (!deduction.success) {
      return { success: false, error: deduction.error || 'Inventory deduction failed' };
    }

    order.status = 'Confirmed';
    order.paymentStatus = 'Paid';
    if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
    if (razorpayOrderId) order.razorpayOrderId = razorpayOrderId;
    order.updatedAt = new Date().toISOString();

    saveOrder(order, 'PaymentGateway');
    NotificationService.sendOrderStatusUpdate(order.customerPhone, order.orderNumber, 'Confirmed');

    return { success: true, order };
  }

  /**
   * Admin status updates (Confirmed -> Processing -> Packed -> Out for Delivery -> Delivered -> Cancelled)
   */
  static updateStatus(orderId: string, newStatus: OrderStatus, actor = 'Admin'): { success: boolean; order?: Order; error?: string } {
    const order = getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    // If cancelled or refunded, restore stock
    if ((newStatus === 'Cancelled' || newStatus === 'Refunded') && oldStatus !== 'Cancelled' && oldStatus !== 'Refunded') {
      const itemsToRestore: CartItemCheck[] = order.items.map(i => ({
        variantSku: i.variantSku,
        quantity: i.quantity
      }));
      InventoryService.restoreStock(itemsToRestore, `${actor} (${order.orderNumber} ${newStatus})`);
      if (newStatus === 'Refunded') {
        order.paymentStatus = 'Refunded';
      }
    }

    saveOrder(order, actor);
    NotificationService.sendOrderStatusUpdate(order.customerPhone, order.orderNumber, newStatus);

    return { success: true, order };
  }

  /**
   * Get orders list for admin
   */
  static getAdminOrders(): Order[] {
    return getAllOrders();
  }

  /**
   * Get orders for a specific customer
   */
  static getCustomerOrders(phone: string): Order[] {
    return getOrdersByCustomerPhone(phone);
  }
}
