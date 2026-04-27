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

    const createdProducts = [];
    for (const p of products) {
      const product = await prisma.product.create({
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
      createdProducts.push(product);
    }

    // Create some recommendations
    for (const product of createdProducts) {
      await prisma.pricingRecommendation.create({
        data: {
          id: uuid(),
          productId: product.id,
          orgId: techMart.id,
          status: 'PENDING',
          recommendedPrice: product.currentPrice * 0.95,
          confidenceScore: 85 + Math.floor(Math.random() * 10),
          rationale: `Based on analysis of 5 competitors and stable demand in the ${product.category} category.`,
          agentOutputs: JSON.stringify({}),
        },
      });

      // Create some historical price changes for the chart
      for (let i = 1; i <= 5; i++) {
        await prisma.priceChange.create({
          data: {
            productId: product.id,
            orgId: techMart.id,
            oldPrice: product.currentPrice * (1 + (i * 0.02)),
            newPrice: product.currentPrice * (1 + ((i - 1) * 0.02)),
            triggeredBy: 'AI',
            executedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
          },
        });
      }
    }

    return NextResponse.json({ message: 'Success! Demo data seeded.' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
