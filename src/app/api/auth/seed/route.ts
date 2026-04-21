import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export async function POST() {
  try {
    // Check if any organization exists
    const orgCount = await prisma.organization.count();
    if (orgCount > 0) {
      return NextResponse.json({ error: 'Database is already seeded or contains data.' }, { status: 400 });
    }

    console.log('Seeding production database...');

    // Create Organizations
    const techMart = await prisma.organization.create({
      data: { id: uuid(), name: 'TechMart Electronics', slug: 'techmart' },
    });

    const electroHub = await prisma.organization.create({
      data: { id: uuid(), name: 'ElectroHub', slug: 'electrohub' },
    });

    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const hashedAnalystPassword = await bcrypt.hash('analyst123', 12);

    // Create TechMart Users
    await prisma.user.createMany({
      data: [
        {
          id: uuid(),
          orgId: techMart.id,
          email: 'admin@techmart.com',
          password: hashedAdminPassword,
          name: 'TechMart Admin',
          role: 'ADMIN',
        },
        {
          id: uuid(),
          orgId: techMart.id,
          email: 'analyst@techmart.com',
          password: hashedAnalystPassword,
          name: 'TechMart Analyst',
          role: 'ANALYST',
        },
      ],
    });

    // Create Org Configs
    await prisma.orgConfig.create({
      data: {
        id: uuid(),
        orgId: techMart.id,
        autoExecuteThreshold: 90,
        maxDiscountPercent: 25,
        marginFloorByCategory: JSON.stringify({
          Electronics: 15,
          Audio: 20,
          Wearables: 25,
          Computing: 12,
          Gaming: 18,
        }),
      },
    });

    const products = [
      { sku: 'TM-WF-1004', name: 'Sony WH-1000XM4', category: 'Audio', price: 348.0, cogs: 210.0, stock: 120 },
      { sku: 'TM-WF-1005', name: 'Sony WH-1000XM5', category: 'Audio', price: 398.0, cogs: 240.0, stock: 45 },
      { sku: 'TM-AP-MAX', name: 'AirPods Max', category: 'Audio', price: 549.0, cogs: 380.0, stock: 12 },
      { sku: 'TM-PS5-SLIM', name: 'PlayStation 5 Slim', category: 'Gaming', price: 499.0, cogs: 410.0, stock: 60 },
    ];

    for (const p of products) {
      await prisma.product.create({
        data: {
          id: uuid(),
          orgId: techMart.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          currentPrice: p.price,
          cogs: p.cogs,
          stockQty: p.stock,
        },
      });
    }

    return NextResponse.json({ message: 'Success! Demo data seeded.' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
