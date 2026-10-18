import { NextResponse } from 'next/server';
import { getDeliveryZones, saveDeliveryZones } from '@/data/db';

export async function GET() {
  try {
    const zones = getDeliveryZones();
    return NextResponse.json({ success: true, zones });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch zones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { zones } = await request.json();
    if (!Array.isArray(zones)) {
      return NextResponse.json({ success: false, error: 'Zones array expected' }, { status: 400 });
    }
    saveDeliveryZones(zones, 'Admin');
    return NextResponse.json({ success: true, zones });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed saving zones' }, { status: 500 });
  }
}
