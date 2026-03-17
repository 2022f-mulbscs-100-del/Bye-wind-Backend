const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = 'superadmin@restaurant.local';
const SUPER_ADMIN_PASSWORD = 'SuperAdmin123!';
const OWNER_EMAIL = 'owner@restaurant.local';
const OWNER_PASSWORD = 'Owner123!';

const RESTAURANT_ID = 'f0836e33-5b0c-4e28-9c74-3c2d1cd2f140';
const MAIN_BRANCH_ID = 'd8b1a5c2-68b1-4fda-9a6b-7c714a5f4a41';
const ROOFTOP_BRANCH_ID = 'a5e9c7d4-1234-41c0-a2c3-9f7a5c5e2c2d';
const RESTAURANT_PLAN = 'Growth';

async function main() {
  console.log('⏳ Seeding Restaurant API database...');

  const [superAdminHash, ownerHash] = await Promise.all([
    bcrypt.hash(SUPER_ADMIN_PASSWORD, 12),
    bcrypt.hash(OWNER_PASSWORD, 12),
  ]);

  await prisma.restaurant.upsert({
    where: { id: RESTAURANT_ID },
    update: {
      brandName: 'Northwind Table',
      legalBusinessName: 'Northwind Restaurant Group',
      registeredAddress: {
        street: '1200 Harbor Drive',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        zipCode: '94111',
      },
      operatingCountry: 'United States',
      timezone: 'America/Los_Angeles',
      cuisineTypes: ['Californian', 'Seafood', 'Contemporary'],
      planTier: RESTAURANT_PLAN,
      primaryContact: {
        name: 'Miranda Shaw',
        email: 'miranda@northwind.table',
        phone: '+1-415-555-0198',
        designation: 'General Manager',
      },
      status: 'LIVE',
      isActive: true,
    },
    create: {
      id: RESTAURANT_ID,
      brandName: 'Northwind Table',
      legalBusinessName: 'Northwind Restaurant Group',
      registeredAddress: {
        street: '1200 Harbor Drive',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        zipCode: '94111',
      },
      operatingCountry: 'United States',
      timezone: 'America/Los_Angeles',
      cuisineTypes: ['Californian', 'Seafood', 'Contemporary'],
      planTier: RESTAURANT_PLAN,
      primaryContact: {
        name: 'Miranda Shaw',
        email: 'miranda@northwind.table',
        phone: '+1-415-555-0198',
        designation: 'General Manager',
      },
      status: 'LIVE',
      isActive: true,
    },
  });

  await prisma.branch.upsert({
    where: { id: MAIN_BRANCH_ID },
    update: {
      name: 'Northwind – Embarcadero',
      address: {
        street: '1200 Harbor Drive Suite 4',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        zipCode: '94111',
      },
      timezone: 'America/Los_Angeles',
      isActive: true,
    },
    create: {
      id: MAIN_BRANCH_ID,
      restaurantId: RESTAURANT_ID,
      name: 'Northwind – Embarcadero',
      address: {
        street: '1200 Harbor Drive Suite 4',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        zipCode: '94111',
      },
      timezone: 'America/Los_Angeles',
      phone: '+1-415-555-0100',
      email: 'embarcadero@northwind.table',
    },
  });

  await prisma.branch.upsert({
    where: { id: ROOFTOP_BRANCH_ID },
    update: {
      name: 'Northwind – Rooftop Lounge',
      address: {
        street: '450 Mission Street Floor 6',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        zipCode: '94105',
      },
      timezone: 'America/Los_Angeles',
      isActive: true,
    },
    create: {
      id: ROOFTOP_BRANCH_ID,
      restaurantId: RESTAURANT_ID,
      name: 'Northwind – Rooftop Lounge',
      address: {
        street: '450 Mission Street Floor 6',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        zipCode: '94105',
      },
      timezone: 'America/Los_Angeles',
      phone: '+1-415-555-0168',
      email: 'rooftop@northwind.table',
    },
  });

  await prisma.goLiveChecklist.upsert({
    where: { restaurantId: RESTAURANT_ID },
    update: {
      restaurantProfileDone: true,
      completionPercentage: 25,
    },
    create: {
      restaurantId: RESTAURANT_ID,
      restaurantProfileDone: true,
      completionPercentage: 25,
    },
  });

  await prisma.staff.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      passwordHash: superAdminHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      email: SUPER_ADMIN_EMAIL,
      passwordHash: superAdminHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  await prisma.staff.upsert({
    where: { email: OWNER_EMAIL },
    update: {
      passwordHash: ownerHash,
      firstName: 'Aurora',
      lastName: 'Vega',
      role: 'OWNER',
      restaurantId: RESTAURANT_ID,
      isActive: true,
    },
    create: {
      email: OWNER_EMAIL,
      passwordHash: ownerHash,
      firstName: 'Aurora',
      lastName: 'Vega',
      role: 'OWNER',
      restaurantId: RESTAURANT_ID,
      isActive: true,
    },
  });

  console.log('✅ Super-admin seeded:', SUPER_ADMIN_EMAIL, '/', SUPER_ADMIN_PASSWORD);
  console.log('✅ Restaurant owner seeded:', OWNER_EMAIL, '/', OWNER_PASSWORD);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
