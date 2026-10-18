import { NextResponse } from 'next/server';
import { ExcelService } from '@/services/ExcelService';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const actor = (formData.get('actor') as string) || 'Admin';

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
