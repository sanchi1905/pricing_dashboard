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

    const { reason } = await request.json();

    if (!reason) {
      return NextResponse.json({ error: 'Reason for rejection is mandatory' }, { status: 400 });
    }

    const recommendation = await prisma.pricingRecommendation.findFirst({
      where: { id, orgId: auth.orgId, status: 'PENDING' },
    });

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found or already resolved' }, { status: 404 });
    }

    // Create approval action (rejection)
    await prisma.approvalAction.create({
      data: {
        id: uuid(),
        recommendationId: id,
        userId: auth.userId,
        action: 'REJECT',
        reason,
      },
    });

    // Update recommendation status
    await prisma.pricingRecommendation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Recommendation rejected' });
  } catch (error) {
    console.error('Reject error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
