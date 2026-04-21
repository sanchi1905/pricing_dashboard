import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromHeaders, requireRole } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const where: Record<string, unknown> = { orgId: auth.orgId };
    if (category) where.category = category;
    if (search) where.name = { contains: search };

    const products = await prisma.product.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: { pricingRecommendations: true },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    requireRole(auth, 'ADMIN');

    const { sku, name, category, currentPrice, cogs, stockQty } = await request.json();

    if (!sku || !name || !category || currentPrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        id: uuid(),
        orgId: auth!.orgId,
        sku,
        name,
        category,
        currentPrice,
        cogs: cogs || 0,
        stockQty: stockQty || 0,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
