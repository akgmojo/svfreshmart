import { getDb, saveDb, findVariationBySku } from '../data/db';

export interface CartItemCheck {
  variantSku: string;
  quantity: number;
}

export interface StockValidationResult {
  isValid: boolean;
  errors: {
    variantSku: string;
    productName: string;
    requested: number;
    available: number;
    message: string;
  }[];
}

export class InventoryService {
  /**
   * Validate stock availability for an array of cart items
   */
  static validateStock(items: CartItemCheck[]): StockValidationResult {
    const errors: StockValidationResult['errors'] = [];

    for (const item of items) {
      const match = findVariationBySku(item.variantSku);
      if (!match) {
        errors.push({
          variantSku: item.variantSku,
          productName: 'Unknown Product',
          requested: item.quantity,
          available: 0,
          message: `Product variation (${item.variantSku}) does not exist.`
        });
        continue;
      }

      const { product, variation } = match;
      if (!product.isActive || !variation.isActive) {
        errors.push({
          variantSku: item.variantSku,
          productName: product.name,
          requested: item.quantity,
          available: 0,
          message: `"${product.name} - ${variation.label}" is currently unavailable.`
        });
        continue;
      }

      if (variation.stock < item.quantity) {
        errors.push({
          variantSku: item.variantSku,
          productName: product.name,
          requested: item.quantity,
          available: variation.stock,
          message: `Only ${variation.stock} units of "${product.name} - ${variation.label}" remaining in stock.`
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Deduct stock upon successful payment or confirmed order
   * Strictly prevents overselling and negative stock
   */
  static deductStock(items: CartItemCheck[], actor = 'OrderSystem'): { success: boolean; error?: string } {
    const db = getDb();
    
    // First pass: verify every item has sufficient stock
    for (const item of items) {
      let found = false;
      for (const product of db.products) {
        const variation = product.variations.find(v => v.variantSku.toUpperCase() === item.variantSku.toUpperCase());
        if (variation) {
          found = true;
          if (variation.stock < item.quantity) {
            return {
              success: false,
              error: `Insufficient stock for ${variation.variantSku}. Available: ${variation.stock}, Requested: ${item.quantity}`
            };
          }
          break;
        }
      }
      if (!found) {
        return { success: false, error: `SKU ${item.variantSku} not found` };
      }
    }

    // Second pass: apply deductions safely
    for (const item of items) {
      for (const product of db.products) {
        const variation = product.variations.find(v => v.variantSku.toUpperCase() === item.variantSku.toUpperCase());
        if (variation) {
          variation.stock = Math.max(0, variation.stock - item.quantity);
          product.updatedAt = new Date().toISOString();
          break;
        }
      }
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'STOCK_DEDUCTED',
      details: `Deducted stock for ${items.length} order items`,
      actor,
      timestamp: new Date().toISOString()
    });

    saveDb(db);
    return { success: true };
  }

  /**
   * Restock items when an order is cancelled or refunded
   */
  static restoreStock(items: CartItemCheck[], actor = 'OrderCancellation'): void {
    const db = getDb();
    for (const item of items) {
      for (const product of db.products) {
        const variation = product.variations.find(v => v.variantSku.toUpperCase() === item.variantSku.toUpperCase());
        if (variation) {
          variation.stock += item.quantity;
          product.updatedAt = new Date().toISOString();
          break;
        }
      }
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'STOCK_RESTORED',
      details: `Restored stock for ${items.length} cancelled items`,
      actor,
      timestamp: new Date().toISOString()
    });

    saveDb(db);
  }
}
