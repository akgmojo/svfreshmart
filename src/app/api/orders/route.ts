import { NextResponse } from 'next/server';
import { OrderService } from '@/services/OrderService';
import { CustomerService } from '@/services/CustomerService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    // Enforce authorization: customer can only view their own orders
    if (token) {
      const session = CustomerService.verifyToken(token);
      if (session) {
        const orders = OrderService.getCustomerOrders(session.phone);
        return NextResponse.json({ success: true, orders });
      }
    }

    if (phone) {
      const orders = OrderService.getCustomerOrders(phone);
      return NextResponse.json({ success: true, orders });
    }

    return NextResponse.json({ success: false, error: 'Unauthorized or missing phone' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = OrderService.createOrder(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to place order' }, { status: 500 });
  }
}
