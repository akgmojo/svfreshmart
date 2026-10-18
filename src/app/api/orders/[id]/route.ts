import { NextResponse } from 'next/server';
import { getOrderById } from '@/data/db';
import { CustomerService } from '@/services/CustomerService';
import { AdminAuthService } from '@/services/AdminAuthService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // 1. Check if caller is an Admin
    const adminSession = AdminAuthService.getAdminFromRequest(request);
    if (adminSession) {
      return NextResponse.json({ success: true, order });
    }

    // 2. Check customer session
    const customerSession = CustomerService.getSessionFromRequest(request);
    if (!customerSession) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Sign in required.' }, { status: 401 });
    }

    // 3. Strict Customer Authorization / Ownership Check (Prevent IDOR)
    const isOwner = 
      order.customerPhone === customerSession.phone || 
      order.customerId === customerSession.id;

    if (!isOwner) {
      // Return 404 to avoid leaking existence of another customer's order ID
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch order details' }, { status: 500 });
  }
}
