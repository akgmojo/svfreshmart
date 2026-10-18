import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

test('Payment Webhook HMAC Signature & Idempotency', () => {
  const secret = 'test_webhook_secret_svfreshmart';
  const body = JSON.stringify({
    id: 'evt_20261018_001',
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_123',
          order_id: 'order_test_456',
          amount: 29900
        }
      }
    }
  });

  const validSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const invalidSignature = 'invalid_tampered_signature';

  function verifyWebhook(payloadBody, sig) {
    const calculated = crypto.createHmac('sha256', secret).update(payloadBody).digest('hex');
    return calculated === sig;
  }

  assert.equal(verifyWebhook(body, validSignature), true);
  assert.equal(verifyWebhook(body, invalidSignature), false);

  // Idempotency test
  const processedEvents = new Set();
  function handleWebhook(eventId) {
    if (processedEvents.has(eventId)) {
      return { status: 200, message: 'Already processed (idempotent duplicate skipped)' };
    }
    processedEvents.add(eventId);
    return { status: 200, message: 'Processed successfully' };
  }

  const call1 = handleWebhook('evt_20261018_001');
  assert.equal(call1.message, 'Processed successfully');

  // Retry delivery of same event
  const call2 = handleWebhook('evt_20261018_001');
  assert.match(call2.message, /Already processed/);
});
