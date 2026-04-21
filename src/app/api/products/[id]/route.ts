import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromHeaders, requireRole } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    requireRole(auth, 'ADMIN');
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { id, orgId: auth!.orgId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await request.json();
    const allowedFields = ['name', 'category', 'currentPrice', 'cogs', 'stockQty'];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // If price is being manually changed, create a price change record
    if (updateData.currentPrice && updateData.currentPrice !== product.currentPrice) {
      await prisma.priceChange.create({
        data: {
          productId: product.id,
          orgId: auth!.orgId,
          oldPrice: product.currentPrice,
          newPrice: updateData.currentPrice as number,
          triggeredBy: 'MANUAL',
        },
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ product: updated });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    console.error('Product PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
