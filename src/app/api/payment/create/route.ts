import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/PaymentService';
import { getOrderById } from '@/data/db';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    const order = getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const paymentResponse = await PaymentService.createOrder({
      orderId: order.id,
      amount: order.totalAmount,
      customerPhone: order.customerPhone,
      customerName: order.customerName
    });

    return NextResponse.json({
      success: true,
      order,
      payment: paymentResponse
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to initialize payment' }, { status: 500 });
  }
}
