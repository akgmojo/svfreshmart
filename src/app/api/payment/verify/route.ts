import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/PaymentService';
import { OrderService } from '@/services/OrderService';

export async function POST(request: Request) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    const isValid = await PaymentService.verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Payment signature verification failed' }, { status: 400 });
    }

    const confirmation = OrderService.confirmPayment(orderId, razorpayPaymentId, razorpayOrderId);

    if (!confirmation.success) {
      return NextResponse.json({ success: false, error: confirmation.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: confirmation.order,
      message: 'Payment verified and order confirmed successfully!'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 500 });
  }
}
