import { NextResponse } from 'next/server';
import { AdminAuthService } from '@/services/AdminAuthService';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const authResult = AdminAuthService.authenticate(username, password);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      admin: authResult.admin,
      token: authResult.token
    });

    // Set secure HTTP-only cookie for admin dashboard
    response.cookies.set('svf_admin_token', authResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60 // 12 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Login process encountered an error.' }, { status: 500 });
  }
}
