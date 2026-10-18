import { NextResponse } from 'next/server';
import { OrderService } from '@/services/OrderService';
import { CustomerService } from '@/services/CustomerService';

export async function GET(request: Request) {
  try {
    const session = CustomerService.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized. You must be logged in to view orders.' 
      }, { status: 401 });
    }

    // STRICT CUSTOMER AUTHORIZATION: Only return orders matching authenticated session phone
    const orders = OrderService.getCustomerOrders(session.phone);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = CustomerService.getSessionFromRequest(request);
    const body = await request.json();

    // If authenticated, enforce customer identity from session
    if (session) {
      body.customerId = session.id;
      body.customerPhone = session.phone;
    } else {
      // Must have valid phone
      if (!body.customerPhone || !/^[6-9]\d{9}$/.test(body.customerPhone.replace(/\D/g, '').slice(-10))) {
        return NextResponse.json({ success: false, error: 'Valid 10-digit mobile number required.' }, { status: 400 });
      }
    }

    const result = OrderService.createOrder(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to place order' }, { status: 500 });
  }
}
