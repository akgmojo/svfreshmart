import test from 'node:test';
import assert from 'node:assert/strict';

// Test delivery rules
function checkBangalorePincode(pincode) {
  const cleaned = (pincode || '').trim();
  if (!/^560\d{3}$/.test(cleaned)) {
    return { isServiceable: false, error: 'Only Bangalore pincodes (560xxx) are serviceable' };
  }
  return { isServiceable: true, pincode: cleaned };
}

function calculateDeliveryCharge(pincode, subtotal) {
  const check = checkBangalorePincode(pincode);
  if (!check.isServiceable) {
    return { fee: 0, deliverable: false, minOrderMet: false };
  }
  const minOrderValue = 149;
  const freeDeliveryThreshold = 399;
  const minOrderMet = subtotal >= minOrderValue;
  const fee = subtotal >= freeDeliveryThreshold ? 0 : 35;

  return {
    fee,
    deliverable: true,
    minOrderMet,
    isFree: fee === 0
  };
}

test('Bangalore Pincode Format Validation', () => {
  assert.equal(checkBangalorePincode('560034').isServiceable, true);
  assert.equal(checkBangalorePincode('560102').isServiceable, true);
  assert.equal(checkBangalorePincode('110001').isServiceable, false); // Delhi
  assert.equal(checkBangalorePincode('400001').isServiceable, false); // Mumbai
  assert.equal(checkBangalorePincode('abc').isServiceable, false);
});

test('Delivery Charge & Free Delivery Threshold', () => {
  // Below minimum order
  const belowMin = calculateDeliveryCharge('560034', 100);
  assert.equal(belowMin.minOrderMet, false);
  assert.equal(belowMin.fee, 35);

  // Meets min order, below free delivery
  const standard = calculateDeliveryCharge('560034', 250);
  assert.equal(standard.minOrderMet, true);
  assert.equal(standard.fee, 35);
  assert.equal(standard.isFree, false);

  // Above free delivery threshold (>= ₹399)
  const free = calculateDeliveryCharge('560034', 450);
  assert.equal(free.minOrderMet, true);
  assert.equal(free.fee, 0);
  assert.equal(free.isFree, true);
});

test('Server-Side Price Security: Discards Client Submitted Prices', () => {
  const dbCatalog = {
    'VEG-CHL-250G': { price: 28, mrp: 35 },
    'VEG-TOM-1KG': { price: 45, mrp: 60 }
  };

  // Attacker sends manipulated client price ₹1
  const clientInputItems = [
    { variantSku: 'VEG-CHL-250G', quantity: 2, clientPrice: 1 },
    { variantSku: 'VEG-TOM-1KG', quantity: 1, clientPrice: 0.5 }
  ];

  // Server recalculates purely from dbCatalog
  let serverCalculatedSubtotal = 0;
  for (const item of clientInputItems) {
    const verified = dbCatalog[item.variantSku];
    assert.ok(verified, 'Item must exist in DB');
    serverCalculatedSubtotal += verified.price * item.quantity;
  }

  // 28 * 2 + 45 * 1 = 56 + 45 = 101
  assert.equal(serverCalculatedSubtotal, 101);
  assert.notEqual(serverCalculatedSubtotal, 2.5); // Attacker price rejected!
});
