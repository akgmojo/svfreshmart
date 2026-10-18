import { NextResponse } from 'next/server';
import { AdminAuthService } from '@/services/AdminAuthService';
import { getAdminById } from '@/data/db';

export async function GET(request: Request) {
  try {
    const session = AdminAuthService.getAdminFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    const admin = getAdminById(session.id);
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, error: 'Admin account not found or deactivated.' }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeAdmin } = admin;

    return NextResponse.json({ success: true, admin: safeAdmin });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to verify admin session' }, { status: 500 });
  }
}

export async function POST() {
  // Admin Logout: Clear cookie
  const response = NextResponse.json({ success: true, message: 'Admin logged out successfully' });
  response.cookies.delete('svf_admin_token');
  return response;
}
