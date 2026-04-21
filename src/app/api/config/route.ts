import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromHeaders, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const config = await prisma.orgConfig.findUnique({
      where: { orgId: auth.orgId },
    });

    if (!config) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    return NextResponse.json({
      config: {
        ...config,
        marginFloorByCategory: JSON.parse(config.marginFloorByCategory),
        escalationRules: JSON.parse(config.escalationRules),
      },
    });
  } catch (error) {
    console.error('Config GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request.headers);
    requireRole(auth, 'ADMIN');

    const body = await request.json();
    const updateData: any = {};

    if (body.autoExecuteThreshold !== undefined) updateData.autoExecuteThreshold = body.autoExecuteThreshold;
    if (body.maxDiscountPercent !== undefined) updateData.maxDiscountPercent = body.maxDiscountPercent;
    if (body.marginFloorByCategory !== undefined) updateData.marginFloorByCategory = JSON.stringify(body.marginFloorByCategory);
    if (body.escalationRules !== undefined) updateData.escalationRules = JSON.stringify(body.escalationRules);

    const config = await prisma.orgConfig.update({
      where: { orgId: auth!.orgId },
      data: updateData,
    });

    return NextResponse.json({
      config: {
        ...config,
        marginFloorByCategory: JSON.parse(config.marginFloorByCategory),
        escalationRules: JSON.parse(config.escalationRules),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    console.error('Config PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
