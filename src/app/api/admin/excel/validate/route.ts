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
      return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions for catalogue upload.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No Excel file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validationResult = ExcelService.validateUpload(buffer);

    return NextResponse.json({
      success: true,
      validation: validationResult
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed parsing Excel file. Ensure valid .xlsx format.' }, { status: 400 });
  }
}
