import { NextResponse } from 'next/server';
import { OrderService } from '@/services/OrderService';
import { OrderStatus } from '@/types';
import { AdminAuthService } from '@/services/AdminAuthService';

export async function GET(request: Request) {
  try {
    const admin = AdminAuthService.getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    if (!AdminAuthService.hasPermission(admin.role, ['Super Admin', 'Store Manager', 'Order Manager', 'Support'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to view orders.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();

    let orders = OrderService.getAdminOrders();

    if (status && status !== 'All') {
      orders = orders.filter(o => o.status === status);
    }

    if (search) {
      orders = orders.filter(o => 
        o.orderNumber.toLowerCase().includes(search) ||
        o.customerPhone.includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.deliveryAddress.pincode.includes(search)
      );
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch admin orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = AdminAuthService.getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    if (!AdminAuthService.hasPermission(admin.role, ['Super Admin', 'Store Manager', 'Order Manager'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to modify order status.' }, { status: 403 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Order ID and status required' }, { status: 400 });
    }

    const result = OrderService.updateStatus(orderId, status as OrderStatus, `${admin.name} (${admin.role})`);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed updating order' }, { status: 500 });
  }
}
