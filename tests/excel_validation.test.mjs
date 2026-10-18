import test from 'node:test';
import assert from 'node:assert/strict';

test('Excel Upload SKU and Price Validation Rules', () => {
  const existingCatalogueSkus = new Set(['VEG-CHL-100G', 'VEG-CHL-250G', 'VEG-TOM-500G', 'DAI-MIL-500ML']);
  const validUnits = ['g', 'kg', 'piece', 'pieces', 'ml', 'L', 'pack', 'box', 'bundle', 'Pack', 'Box', 'Bundle', 'bottle', 'jar'];

  function validateRow(row) {
    const errors = [];
    if (!row.variantSku) {
      errors.push('Missing SKU');
    } else if (!existingCatalogueSkus.has(row.variantSku)) {
      errors.push(`Unknown SKU "${row.variantSku}"`);
    }

    if (isNaN(row.price) || row.price <= 0) {
      errors.push('Invalid price');
    }
    if (isNaN(row.mrp) || row.mrp <= 0) {
      errors.push('Invalid MRP');
    }
    if (row.price > row.mrp) {
      errors.push('Selling price exceeds MRP');
    }
    if (isNaN(row.stock) || row.stock < 0 || !Number.isInteger(row.stock)) {
      errors.push('Invalid stock');
    }
    if (row.unit && !validUnits.includes(row.unit)) {
      errors.push(`Invalid unit "${row.unit}"`);
    }

    return { isValid: errors.length === 0, errors };
  }

  // Valid row
  const validRow = {
    variantSku: 'VEG-CHL-250G',
    price: 30,
    mrp: 35,
    stock: 20,
    unit: 'g'
  };
  assert.equal(validateRow(validRow).isValid, true);

  // Unknown SKU row
  const unknownSkuRow = {
    variantSku: 'UNKNOWN-XYZ-999',
    price: 50,
    mrp: 60,
    stock: 10,
    unit: 'kg'
  };
  const unknownRes = validateRow(unknownSkuRow);
  assert.equal(unknownRes.isValid, false);
  assert.match(unknownRes.errors[0], /Unknown SKU/);

  // Price exceeds MRP row
  const invalidPriceRow = {
    variantSku: 'VEG-TOM-500G',
    price: 100,
    mrp: 50, // Selling price > MRP!
    stock: 10,
    unit: 'g'
  };
  const priceRes = validateRow(invalidPriceRow);
  assert.equal(priceRes.isValid, false);
  assert.match(priceRes.errors[0], /Selling price exceeds MRP/);
});
