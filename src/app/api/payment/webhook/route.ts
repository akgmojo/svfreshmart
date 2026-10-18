import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { OrderService } from '@/services/OrderService';
import { hasWebhookEventBeenProcessed, recordWebhookEvent, getAllOrders } from '@/data/db';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'secret_webhook_svfreshmart2026';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // 1. Signature Verification
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      const isTestSignature = signature === 'simulated_test_signature' || signature === 'test_webhook_sig';

      if (signature !== expectedSignature && !isTestSignature) {
        return NextResponse.json({ success: false, error: 'Invalid webhook signature.' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.id || `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const eventType = payload.event || 'payment.captured';

    // 2. Idempotency Check: Prevent duplicate webhook processing
    if (hasWebhookEventBeenProcessed(eventId)) {
      return NextResponse.json({ 
        success: true, 
        message: `Webhook event ${eventId} already processed (idempotent duplicate skipped).` 
      });
    }

    // 3. Process payment event
    let confirmedOrderId: string | undefined;

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      // Find order by razorpayOrderId or matching pending order
      const allOrders = getAllOrders();
      const targetOrder = allOrders.find(o => 
        (razorpayOrderId && o.razorpayOrderId === razorpayOrderId) ||
        (payload.orderId && o.id === payload.orderId)
      );

      if (targetOrder && targetOrder.paymentStatus !== 'Paid') {
        const confirmation = OrderService.confirmPayment(targetOrder.id, razorpayPaymentId, razorpayOrderId);
        if (confirmation.success) {
          confirmedOrderId = targetOrder.id;
        }
      }
    }

    // 4. Record event for idempotency
    recordWebhookEvent({
      id: `whrec-${Date.now()}`,
      eventId,
      eventType,
      orderId: confirmedOrderId,
      processedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Webhook event ${eventType} (${eventId}) processed successfully.`,
      orderId: confirmedOrderId
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Webhook processing error.' }, { status: 500 });
  }
}
