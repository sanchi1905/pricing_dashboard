import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromHeaders } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const { overridePrice } = await request.json().catch(() => ({}));

    const recommendation = await prisma.pricingRecommendation.findFirst({
      where: { id, orgId: auth.orgId, status: 'PENDING' },
      include: { product: true },
    });

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found or already resolved' }, { status: 404 });
    }

    const finalPrice = overridePrice || recommendation.recommendedPrice;
    const action = overridePrice ? 'MODIFY' : 'APPROVE';

    // Create approval action
    await prisma.approvalAction.create({
      data: {
        id: uuid(),
        recommendationId: id,
        userId: auth.userId,
        action,
        overridePrice: overridePrice || null,
        reason: overridePrice ? `Price overridden to $${overridePrice}` : null,
      },
    });

    // Update recommendation status
    await prisma.pricingRecommendation.update({
      where: { id },
      data: {
        status: 'APPROVED',
        resolvedAt: new Date(),
      },
    });

    // Create price change record
    await prisma.priceChange.create({
      data: {
        productId: recommendation.productId,
        orgId: auth.orgId,
        oldPrice: recommendation.product.currentPrice,
        newPrice: finalPrice,
        triggeredBy: overridePrice ? 'OVERRIDE' : 'AI',
        recommendationId: id,
      },
    });

    // Update product price
    await prisma.product.update({
      where: { id: recommendation.productId },
      data: { currentPrice: finalPrice },
    });

    return NextResponse.json({ 
      message: 'Recommendation approved',
      action,
      newPrice: finalPrice,
    });
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
