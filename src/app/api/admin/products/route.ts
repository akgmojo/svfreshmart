import { NextResponse } from 'next/server';
import { getAllProducts, saveProduct, getProductById } from '@/data/db';
import { Product } from '@/types';
import { AdminAuthService } from '@/services/AdminAuthService';

export async function GET(request: Request) {
  try {
    const admin = AdminAuthService.getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    const products = getAllProducts(true);
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = AdminAuthService.getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    if (!AdminAuthService.hasPermission(admin.role, ['Super Admin', 'Store Manager', 'Inventory Manager'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to create products.' }, { status: 403 });
    }

    const data = await request.json();
    const product: Product = {
      id: `prod-${Date.now()}`,
      productSku: data.productSku || `SVF-PRD-${Date.now().toString().slice(-4)}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      category: data.category || 'Vegetables',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      isActive: data.isActive !== false,
      variations: data.variations || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveProduct(product, `${admin.name} (${admin.role})`);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed creating product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = AdminAuthService.getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    if (!AdminAuthService.hasPermission(admin.role, ['Super Admin', 'Store Manager', 'Inventory Manager'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions to edit products.' }, { status: 403 });
    }

    const data = await request.json();
    const existing = getProductById(data.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const updated: Product = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    saveProduct(updated, `${admin.name} (${admin.role})`);
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed updating product' }, { status: 500 });
  }
}
