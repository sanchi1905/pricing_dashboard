import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.priceChange.deleteMany();
  await prisma.approvalAction.deleteMany();
  await prisma.pricingRecommendation.deleteMany();
  await prisma.competitorPrice.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.orgConfig.deleteMany();
  await prisma.organization.deleteMany();

  // Create Organizations
  const techMart = await prisma.organization.create({
    data: {
      id: uuid(),
      name: 'TechMart Electronics',
      slug: 'techmart',
    },
  });

  const electroHub = await prisma.organization.create({
    data: {
      id: uuid(),
      name: 'ElectroHub',
      slug: 'electrohub',
    },
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

  // Create ElectroHub Users
  await prisma.user.createMany({
    data: [
      {
        id: uuid(),
        orgId: electroHub.id,
        email: 'admin@electrohub.com',
        password: hashedAdminPassword,
        name: 'ElectroHub Admin',
        role: 'ADMIN',
      },
    ],
  });

  // Create Org Configs
  await prisma.orgConfig.createMany({
    data: [
      {
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
      {
        id: uuid(),
        orgId: electroHub.id,
        autoExecuteThreshold: 85,
        maxDiscountPercent: 30,
        marginFloorByCategory: JSON.stringify({
          Electronics: 10,
          Audio: 15,
        }),
      },
    ],
  });

  const techMartProducts = [
    { sku: 'TM-WF-1004', name: 'Sony WH-1000XM4', category: 'Audio', price: 348.0, cogs: 210.0, stock: 120 },
    { sku: 'TM-WF-1005', name: 'Sony WH-1000XM5', category: 'Audio', price: 398.0, cogs: 240.0, stock: 45 },
    { sku: 'TM-AP-MAX', name: 'AirPods Max', category: 'Audio', price: 549.0, cogs: 380.0, stock: 12 },
    { sku: 'TM-AW-U2', name: 'Apple Watch Ultra 2', category: 'Wearables', price: 799.0, cogs: 520.0, stock: 85 },
    { sku: 'TM-GW-6', name: 'Samsung Galaxy Watch 6', category: 'Wearables', price: 299.0, cogs: 180.0, stock: 210 },
    { sku: 'TM-MBP-14', name: 'MacBook Pro 14"', category: 'Computing', price: 1999.0, cogs: 1450.0, stock: 18 },
    { sku: 'TM-PS5-SLIM', name: 'PlayStation 5 Slim', category: 'Gaming', price: 499.0, cogs: 410.0, stock: 60 },
  ];

  for (const p of techMartProducts) {
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

  const electroHubProducts = [
    { sku: 'EH-D-Z6', name: 'Nikon Z6 II', category: 'Electronics', price: 1999.0, cogs: 1600.0, stock: 5 },
    { sku: 'EH-L-R6', name: 'Canon EOS R6 Mark II', category: 'Electronics', price: 2499.0, cogs: 2000.0, stock: 3 },
  ];

  for (const p of electroHubProducts) {
    await prisma.product.create({
      data: {
        id: uuid(),
        orgId: electroHub.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        currentPrice: p.price,
        cogs: p.cogs,
        stockQty: p.stock,
      },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
