import { NextResponse } from 'next/server';
import { getDeliveryZones, saveDeliveryZones } from '@/data/db';
import { AdminAuthService } from '@/services/AdminAuthService';

export async function GET(request: Request) {
  try {
    const admin = AdminAuthService.getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    const zones = getDeliveryZones();
    return NextResponse.json({ success: true, zones });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch zones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = AdminAuthService.getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    if (!AdminAuthService.hasPermission(admin.role, ['Super Admin', 'Store Manager'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to modify delivery zones.' }, { status: 403 });
    }

    const { zones } = await request.json();
    if (!Array.isArray(zones)) {
      return NextResponse.json({ success: false, error: 'Zones array expected' }, { status: 400 });
    }
    saveDeliveryZones(zones, `${admin.name} (${admin.role})`);
    return NextResponse.json({ success: true, zones });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed saving zones' }, { status: 500 });
  }
}
