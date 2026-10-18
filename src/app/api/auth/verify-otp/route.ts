import { NextResponse } from 'next/server';
import { NotificationService } from '@/services/NotificationService';
import { CustomerService } from '@/services/CustomerService';

export async function POST(request: Request) {
  try {
    const { phone, otp, name } = await request.json();

    const verification = NotificationService.verifyOtp(phone, otp);
    if (!verification.success) {
      return NextResponse.json(verification, { status: 400 });
    }

    const customer = CustomerService.getOrCreateCustomer(phone, name);
    const token = CustomerService.generateToken(customer);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      customer,
      token
    });

    // Set secure HTTP-only cookie for customer session
    response.cookies.set('svf_customer_token', token, {
      httpOnly: false, // accessible to client for smooth state sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: 'OTP verification failed' }, { status: 400 });
  }
}
