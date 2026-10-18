import { NextResponse } from 'next/server';
import { CustomerService } from '@/services/CustomerService';
import { getCustomerByPhone } from '@/data/db';

export async function GET(request: Request) {
  try {
    const session = CustomerService.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const customer = getCustomerByPhone(session.phone);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Session check failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = CustomerService.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json();
    const { address, action, addressId } = body;

    // Handle delete action
    if (action === 'delete' && addressId) {
      const updatedCustomer = CustomerService.removeAddress(session.phone, addressId);
      return NextResponse.json({ success: true, customer: updatedCustomer });
    }

    if (!address) {
      return NextResponse.json({ success: false, error: 'Missing address payload' }, { status: 400 });
    }

    // Always use authenticated session phone, NEVER trust client-submitted phone!
    const updatedCustomer = CustomerService.saveAddress(session.phone, address);
    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed saving address' }, { status: 500 });
  }
}
