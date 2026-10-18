import { NextResponse } from 'next/server';
import { NotificationService } from '@/services/NotificationService';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    const result = NotificationService.generateOtp(phone);

    if (!result.success) {
      return NextResponse.json(result, { status: 429 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}
