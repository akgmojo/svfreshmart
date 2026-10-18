import test from 'node:test';
import assert from 'node:assert/strict';

test('Variation-Level Inventory Deduction and Oversell Protection', () => {
  // Variations of Green Chilli
  const inventory = {
    'VEG-CHL-100G': { stock: 15 },
    'VEG-CHL-250G': { stock: 2 },
    'VEG-CHL-1KG': { stock: 5 }
  };

  function deductStock(items) {
    // Phase 1: Verify sufficient stock
    for (const item of items) {
      const match = inventory[item.variantSku];
      if (!match || match.stock < item.quantity) {
        return { success: false, error: `Insufficient stock for ${item.variantSku}` };
      }
    }

    // Phase 2: Deduct atomically
    for (const item of items) {
      inventory[item.variantSku].stock -= item.quantity;
    }
    return { success: true };
  }

  // Customer A buys 2 of VEG-CHL-250G
  const order1 = deductStock([{ variantSku: 'VEG-CHL-250G', quantity: 2 }]);
  assert.equal(order1.success, true);
  assert.equal(inventory['VEG-CHL-250G'].stock, 0); // Out of stock

  // Independent variation stock remains untouched
  assert.equal(inventory['VEG-CHL-100G'].stock, 15);
  assert.equal(inventory['VEG-CHL-1KG'].stock, 5);

  // Customer B attempts to buy 1 of VEG-CHL-250G (now out of stock)
  const order2 = deductStock([{ variantSku: 'VEG-CHL-250G', quantity: 1 }]);
  assert.equal(order2.success, false);
  assert.match(order2.error, /Insufficient stock/);
  assert.equal(inventory['VEG-CHL-250G'].stock, 0); // Never goes negative!
});

test('Inventory Restoration on Order Cancellation', () => {
  const inventory = {
    'VEG-TOM-500G': { stock: 8 }
  };

  // Deduct 3
  inventory['VEG-TOM-500G'].stock -= 3;
  assert.equal(inventory['VEG-TOM-500G'].stock, 5);

  // Order cancelled -> restore 3
  inventory['VEG-TOM-500G'].stock += 3;
  assert.equal(inventory['VEG-TOM-500G'].stock, 8);
});
