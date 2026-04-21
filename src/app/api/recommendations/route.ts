import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromHeaders } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const minConfidence = searchParams.get('minConfidence');
    const productId = searchParams.get('productId');

    const where: Record<string, unknown> = { orgId: auth.orgId };
    if (status) where.status = status;
    if (productId) where.productId = productId;
    if (minConfidence) where.confidenceScore = { gte: parseInt(minConfidence) };

    const recommendations = await prisma.pricingRecommendation.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, sku: true, category: true, currentPrice: true },
        },
        approvalActions: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
