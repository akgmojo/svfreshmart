import { NextResponse } from 'next/server';
import { ExcelService } from '@/services/ExcelService';

export async function POST(request: Request) {
  try {
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
