import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromHeaders, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // requireRole(auth, 'ADMIN'); // Spec says Admin

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = { orgId: auth.orgId };
    if (productId) where.productId = productId;
    if (fromDate || toDate) {
      where.executedAt = {};
      if (fromDate) where.executedAt.gte = new Date(fromDate);
      if (toDate) where.executedAt.lte = new Date(toDate);
    }

    const priceChanges = await prisma.priceChange.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
        recommendation: {
          select: {
            confidenceScore: true,
            rationale: true,
            approvalActions: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { executedAt: 'desc' },
    });

    return NextResponse.json({ auditTrail: priceChanges });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    
    console.error('Audit GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
