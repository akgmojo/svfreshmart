import { NextResponse } from 'next/server';
import { getAllOrders, getAllProducts, getAuditLogs } from '@/data/db';
import { AdminAuthService } from '@/services/AdminAuthService';

export async function GET(request: Request) {
  try {
    const admin = AdminAuthService.getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    if (!AdminAuthService.hasPermission(admin.role, ['Super Admin', 'Store Manager', 'Inventory Manager', 'Order Manager'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to view dashboard stats.' }, { status: 403 });
    }

    const orders = getAllOrders();
    const products = getAllProducts(true);
    const auditLogs = getAuditLogs();

    const pendingOrders = orders.filter(o => o.status === 'Pending Payment' || o.status === 'Confirmed' || o.status === 'Processing');
    const completedOrders = orders.filter(o => o.status === 'Delivered' || (o.paymentStatus === 'Paid' && o.status !== 'Cancelled'));
    const totalSales = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    let lowStockCount = 0;
    let outOfStockCount = 0;
    const inventoryAlerts: { productName: string; variantSku: string; label: string; stock: number }[] = [];

    for (const prod of products) {
      for (const v of prod.variations) {
        if (v.stock === 0) {
          outOfStockCount++;
          inventoryAlerts.push({ productName: prod.name, variantSku: v.variantSku, label: v.label, stock: 0 });
        } else if (v.stock <= 10) {
          lowStockCount++;
          inventoryAlerts.push({ productName: prod.name, variantSku: v.variantSku, label: v.label, stock: v.stock });
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        totalSales,
        lowStockCount,
        outOfStockCount,
        totalProducts: products.length,
      },
      inventoryAlerts: inventoryAlerts.slice(0, 10),
      recentOrders: orders.slice(0, 8),
      auditLogs: auditLogs.slice(0, 12)
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed calculating stats' }, { status: 500 });
  }
}
