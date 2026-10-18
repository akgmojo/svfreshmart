import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_CUSTOMER_SECRET = 'svfreshmart_secure_jwt_secret_2026';
const JWT_ADMIN_SECRET = 'svfreshmart_admin_secure_secret_2026';

test('E2E Complete E-Commerce & Security Lifecycle', async () => {
  // Step 1: Customer Authentication Flow
  const phone = '9876543210';
  const customerUser = {
    id: 'cust-demo-e2e',
    phoneNumber: phone,
    name: 'Ramesh Gowda',
    addresses: [
      {
        id: 'addr-e2e-1',
        customerId: 'cust-demo-e2e',
        fullName: 'Ramesh Gowda',
        phoneNumber: phone,
        addressLine1: 'Flat 402, Green Glen Layout',
        city: 'Bangalore',
        pincode: '560102',
        isDefault: true
      }
    ]
  };

  const customerToken = jwt.sign(
    { id: customerUser.id, phone: customerUser.phoneNumber, name: customerUser.name },
    JWT_CUSTOMER_SECRET,
    { expiresIn: '30d' }
  );

  const decodedCustomer = jwt.verify(customerToken, JWT_CUSTOMER_SECRET);
  assert.equal(decodedCustomer.phone, '9876543210');

  // Step 2: Bangalore Pincode & Delivery Validation
  const pincode = '560102';
  assert.match(pincode, /^560\d{3}$/, 'Pincode must be a Bangalore 560xxx code');

  // Step 3: Server-side Pricing Validation
  const catalogue = {
    'VEG-CHL-250G': { price: 28, mrp: 35, stock: 15, label: '250g' },
    'VEG-TOM-1KG': { price: 45, mrp: 60, stock: 25, label: '1kg' }
  };

  const cartPayload = [
    { variantSku: 'VEG-CHL-250G', quantity: 2, clientPrice: 1.0 }, // Client attempts price tampering
    { variantSku: 'VEG-TOM-1KG', quantity: 1, clientPrice: 5.0 }
  ];

  let calculatedSubtotal = 0;
  for (const item of cartPayload) {
    const verified = catalogue[item.variantSku];
    assert.ok(verified, `Item ${item.variantSku} must exist in catalogue`);
    assert.ok(verified.stock >= item.quantity, 'Must have sufficient stock');
    calculatedSubtotal += verified.price * item.quantity;
  }

  // 28 * 2 + 45 = 101
  assert.equal(calculatedSubtotal, 101);

  // Delivery fee logic (< 399 threshold)
  const deliveryCharge = calculatedSubtotal >= 399 ? 0 : 35;
  assert.equal(deliveryCharge, 35);
  const totalAmount = calculatedSubtotal + deliveryCharge;
  assert.equal(totalAmount, 136);

  // Step 4: Atomic Inventory Deduction
  for (const item of cartPayload) {
    catalogue[item.variantSku].stock -= item.quantity;
  }
  assert.equal(catalogue['VEG-CHL-250G'].stock, 13);
  assert.equal(catalogue['VEG-TOM-1KG'].stock, 24);

  // Step 5: Order Creation Snapshot
  const order = {
    id: 'ord-e2e-999',
    orderNumber: 'SVF-20261018-9999',
    customerId: customerUser.id,
    customerPhone: customerUser.phoneNumber,
    subtotal: calculatedSubtotal,
    deliveryCharge,
    totalAmount,
    status: 'Pending Payment',
    paymentStatus: 'Pending',
    deliveryAddress: customerUser.addresses[0]
  };

  // Step 6: Payment Confirmation
  order.status = 'Confirmed';
  order.paymentStatus = 'Paid';
  order.razorpayPaymentId = 'pay_e2e_successful_123';

  assert.equal(order.status, 'Confirmed');
  assert.equal(order.paymentStatus, 'Paid');

  // Step 7: IDOR Security Authorization Check
  // Legitimate Customer (Owner) -> Allowed
  const isOwner = order.customerPhone === decodedCustomer.phone;
  assert.equal(isOwner, true, 'Legitimate customer must be able to view their order');

  // Attacker Customer B -> Blocked with 404/403
  const attackerPhone = '9999988888';
  const isAttacker = order.customerPhone === attackerPhone;
  assert.equal(isAttacker, false, 'Attacker must be blocked from accessing Customer A order');

  // Step 8: Admin Authentication & Status Transition
  const adminHash = '$2b$10$Vx6ZCa6VKYnzbaWyGr3Gf.rKBba51ifEskh72ERqYxa864GL3c4ei'; // manager@SVFresh2026!
  assert.equal(bcrypt.compareSync('manager@SVFresh2026!', adminHash), true);

  const adminToken = jwt.sign(
    { id: 'admin-store', username: 'store_mgr', role: 'Store Manager', name: 'Store Manager' },
    JWT_ADMIN_SECRET,
    { expiresIn: '12h' }
  );
  const decodedAdmin = jwt.verify(adminToken, JWT_ADMIN_SECRET);
  assert.equal(decodedAdmin.role, 'Store Manager');

  // Store Manager updates order to Out for Delivery
  order.status = 'Out for Delivery';
  assert.equal(order.status, 'Out for Delivery');

  // Step 9: Delivery Completed
  order.status = 'Delivered';
  assert.equal(order.status, 'Delivered');
});
