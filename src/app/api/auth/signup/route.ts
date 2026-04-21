import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { orgName, email, password, name } = await request.json();

    if (!orgName || !email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields: orgName, email, password, name' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const hashedPassword = await hashPassword(password);

    // Create organization
    const org = await prisma.organization.create({
      data: {
        id: uuid(),
        name: orgName,
        slug,
      },
    });

    // Create admin user
    const user = await prisma.user.create({
      data: {
        id: uuid(),
        orgId: org.id,
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
      },
    });

    // Create default org config
    await prisma.orgConfig.create({
      data: {
        id: uuid(),
        orgId: org.id,
        autoExecuteThreshold: 90,
        maxDiscountPercent: 25,
        marginFloorByCategory: JSON.stringify({
          Electronics: 15,
          Audio: 20,
          Wearables: 25,
          Computing: 12,
          Gaming: 18,
        }),
        escalationRules: JSON.stringify({
          highValueThreshold: 1000,
          requireAdminAbove: 500,
        }),
      },
    });

    const token = signToken({
      userId: user.id,
      orgId: org.id,
      role: user.role,
      email: user.email,
    });

    const response = NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      org: { id: org.id, name: org.name, slug: org.slug },
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
