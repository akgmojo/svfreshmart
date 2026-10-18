import { NextResponse } from 'next/server';
import { ExcelService } from '@/services/ExcelService';
import { AdminAuthService } from '@/services/AdminAuthService';

export async function GET(request: Request) {
  try {
    const admin = AdminAuthService.getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    if (!AdminAuthService.hasPermission(admin.role, ['Super Admin', 'Store Manager', 'Inventory Manager'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions for catalogue export.' }, { status: 403 });
    }

    const buffer = ExcelService.generateCatalogueTemplate();
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="svfreshmart_price_stock_${new Date().toISOString().slice(0, 10)}.xlsx"`
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed generating Excel template' }, { status: 500 });
  }
}
