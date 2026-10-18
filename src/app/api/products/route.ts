import { NextResponse } from 'next/server';
import { getAllProducts } from '@/data/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();

    let products = getAllProducts(false);

    if (category && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        p.variations.some(v => v.variantSku.toLowerCase().includes(search))
      );
    }

    const categories = Array.from(new Set(getAllProducts(false).map(p => p.category)));

    return NextResponse.json({
      success: true,
      products,
      categories: ['All', ...categories]
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}
