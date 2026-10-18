import { NextResponse } from 'next/server';
import { ExcelService } from '@/services/ExcelService';

export async function GET() {
  try {
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
