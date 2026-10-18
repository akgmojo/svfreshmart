import { NextResponse } from 'next/server';
import { CustomerService } from '@/services/CustomerService';
import { getCustomerByPhone } from '@/data/db';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    const session = CustomerService.verifyToken(token);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const customer = getCustomerByPhone(session.phone);
    return NextResponse.json({ success: true, customer });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Session check failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, address } = body;

    if (!phone || !address) {
      return NextResponse.json({ success: false, error: 'Missing phone or address' }, { status: 400 });
    }

    const updatedCustomer = CustomerService.saveAddress(phone, address);
    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed saving address' }, { status: 500 });
  }
}
