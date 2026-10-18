import { findVariationBySku } from '../data/db';
import { DeliveryService } from './DeliveryService';
import { OrderItem } from '../types';

export interface CartInputItem {
  variantSku: string;
  quantity: number;
}

export interface PricingSummary {
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  totalSavings: number;
  pincode: string;
  isDeliverable: boolean;
  minOrderMet: boolean;
  minOrderValue: number;
  freeDeliveryThreshold: number;
}

export class PricingService {
  /**
   * Authoritative server-side pricing calculation
   * Client-submitted prices are NEVER trusted
   */
  static calculateCart(items: CartInputItem[], pincode: string): PricingSummary {
    const verifiedItems: OrderItem[] = [];
    let subtotal = 0;
    let totalMrp = 0;

    for (const item of items) {
      const match = findVariationBySku(item.variantSku);
      if (!match) continue;

      const { product, variation } = match;
      if (!product.isActive || !variation.isActive) continue;

      const qty = Math.max(1, Math.floor(item.quantity));
      const lineSubtotal = variation.price * qty;
      const lineMrp = variation.mrp * qty;

      subtotal += lineSubtotal;
      totalMrp += lineMrp;

      verifiedItems.push({
        id: `item-${variation.id}-${Date.now()}`,
        orderId: '',
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        variationId: variation.id,
        variantSku: variation.variantSku,
        quantity: qty,
        unitLabel: variation.label,
        unitPrice: variation.price,
        subtotal: lineSubtotal
      });
    }

    const deliveryResult = DeliveryService.calculateDeliveryCharge(pincode, subtotal);
    const check = DeliveryService.checkPincode(pincode);

    const deliveryCharge = verifiedItems.length > 0 && check.isServiceable ? deliveryResult.deliveryFee : 0;
    const totalAmount = subtotal + deliveryCharge;
    const totalSavings = Math.max(0, totalMrp - subtotal);

    return {
      items: verifiedItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      totalSavings,
      pincode,
      isDeliverable: check.isServiceable,
      minOrderMet: deliveryResult.minOrderMet,
      minOrderValue: deliveryResult.minOrderValue,
      freeDeliveryThreshold: check.freeDeliveryThreshold
    };
  }
}
