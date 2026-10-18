import { NextResponse } from 'next/server';
import { DeliveryService } from '@/services/DeliveryService';

export async function POST(request: Request) {
  try {
    const { pincode, subtotal } = await request.json();
    const check = DeliveryService.checkPincode(pincode);
    const chargeInfo = DeliveryService.calculateDeliveryCharge(pincode, subtotal || 0);

    return NextResponse.json({
      success: true,
      ...check,
      ...chargeInfo
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid delivery check request' }, { status: 400 });
  }
}
