import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'svfreshmart_test_secret_key';

function generateCustomerToken(customer) {
  return jwt.sign(
    { id: customer.id, phone: customer.phone, name: customer.name },
    TEST_SECRET,
    { expiresIn: '1h' }
  );
}

function verifyCustomerToken(token) {
  try {
    return jwt.verify(token, TEST_SECRET);
  } catch {
    return null;
  }
}

test('Customer Token Generation and Verification', () => {
  const customer = { id: 'cust-101', phone: '9876543210', name: 'Ramesh Gowda' };
  const token = generateCustomerToken(customer);
  const decoded = verifyCustomerToken(token);

  assert.ok(decoded);
  assert.equal(decoded.id, 'cust-101');
  assert.equal(decoded.phone, '9876543210');
});

test('Customer IDOR Prevention: Cannot View Another Customer Order', () => {
  const orderA = {
    id: 'ord-101',
    customerPhone: '9876543210',
    customerId: 'cust-101',
    totalAmount: 499
  };

  const customerB = {
    id: 'cust-999',
    phone: '9123456780',
    name: 'Mallesh Rao'
  };

  // Customer B tries to view Customer A's order
  function authorizeOrderView(order, requestingCustomer) {
    const isOwner = 
      order.customerPhone === requestingCustomer.phone ||
      order.customerId === requestingCustomer.id;

    if (!isOwner) {
      return { authorized: false, status: 404, error: 'Order not found' };
    }
    return { authorized: true, status: 200, order };
  }

  const result = authorizeOrderView(orderA, customerB);
  assert.equal(result.authorized, false);
  assert.equal(result.status, 404); // Returns 404, preventing enumeration!
});

test('OTP Attempt Limit: Invalidates after 3 failed attempts', () => {
  const otpRecord = {
    phone: '9876543210',
    code: '849201',
    attempts: 0,
    maxAttempts: 3
  };

  function attemptVerify(submitted) {
    otpRecord.attempts++;
    if (otpRecord.attempts > otpRecord.maxAttempts) {
      return { success: false, code: 'EXCEEDED' };
    }
    if (submitted === otpRecord.code) {
      return { success: true };
    }
    return { success: false, code: 'WRONG_CODE' };
  }

  // Attempt 1: wrong
  assert.equal(attemptVerify('000000').code, 'WRONG_CODE');
  // Attempt 2: wrong
  assert.equal(attemptVerify('111111').code, 'WRONG_CODE');
  // Attempt 3: wrong
  assert.equal(attemptVerify('222222').code, 'WRONG_CODE');
  // Attempt 4: exceeds limit
  assert.equal(attemptVerify('849201').code, 'EXCEEDED');
});
