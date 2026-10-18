import { NextResponse } from 'next/server';
import { ExcelService } from '@/services/ExcelService';
import { AdminAuthService } from '@/services/AdminAuthService';

export async function POST(request: Request) {
  try {
    const admin = AdminAuthService.getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    if (!AdminAuthService.hasPermission(admin.role, ['Super Admin', 'Store Manager', 'Inventory Manager'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions for catalogue update.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const actor = `${admin.name} (${admin.role})`;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No Excel file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = ExcelService.commitUpdates(buffer, actor);

    if (!result.success) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed committing Excel updates.' }, { status: 500 });
  }
}
