import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromHeaders } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const recommendation = await prisma.pricingRecommendation.findFirst({
      where: { id, orgId: auth.orgId },
      include: {
        product: true,
        approvalActions: {
          include: {
            user: { select: { name: true, email: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    // Check tenant isolation
    if (recommendation.orgId !== auth.orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      recommendation: {
        ...recommendation,
        agentOutputs: JSON.parse(recommendation.agentOutputs),
      },
    });
  } catch (error) {
    console.error('Recommendation detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
