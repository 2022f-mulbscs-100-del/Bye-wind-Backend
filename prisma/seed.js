const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// Admin User
const ADMIN_EMAIL = 'admin@restaurant.local';
const ADMIN_PASSWORD = 'Admin123456!';

// Owner User
const OWNER_EMAIL = 'owner@restaurant.local';
const OWNER_PASSWORD = 'Owner123456!';

// Guest User
const GUEST_EMAIL = 'guest@restaurant.local';
const GUEST_PASSWORD = 'Guest123456!';

const RESTAURANT_ID = 'f0836e33-5b0c-4e28-9c74-3c2d1cd2f140';
const MAIN_BRANCH_ID = 'd8b1a5c2-68b1-4fda-9a6b-7c714a5f4a41'; 
const ROOFTOP_BRANCH_ID = 'a5e9c7d4-1234-41c0-a2c3-9f7a5c5e2c2d';
const RESTAURANT_PLAN = 'Growth';

async function main() {
  console.log('⏳ Seeding Restaurant API database...');

  // Hash passwords
  const [adminHash, ownerHash, guestHash] = await Promise.all([
    bcrypt.hash(ADMIN_PASSWORD, 12),
    bcrypt.hash(OWNER_PASSWORD, 12),
    bcrypt.hash(GUEST_PASSWORD, 12),
  ]);

  // Create or update ADMIN user
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash: adminHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Create or update OWNER user
  const ownerUser = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {
      passwordHash: ownerHash,
      firstName: 'Aurora',
      lastName: 'Vega',
      role: 'OWNER',
      isActive: true,
    },
    create:{
      email: OWNER_EMAIL,
      passwordHash: ownerHash,
      firstName: 'Aurora',
      lastName: 'Vega',
      role: 'OWNER',
      isActive: true,
    },
  });

  // Create or update GUEST user
  await prisma.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {
      passwordHash: guestHash,
      firstName: 'John',
      lastName: 'Guest',
      role: 'GUEST',
      isActive: true,
    },
    create: {
      email: GUEST_EMAIL,
      passwordHash: guestHash,
      firstName: 'John',
      lastName: 'Guest',
      role: 'GUEST',
      isActive: true,
    },
  });

  // Create restaurant owned by OWNER user
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
      ownerId: ownerUser.id,
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
      ownerId: ownerUser.id,
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

  // Create sample staff members for the restaurant
  await prisma.staff.upsert({
    where: { email: 'manager@northwind.table' },
    update: {
      firstName: 'James',
      lastName: 'Wilson',
      role: 'MANAGER',
      isActive: true,
    },
    create: {
      email: 'manager@northwind.table',
      firstName: 'James',
      lastName: 'Wilson',
      role: 'MANAGER',
      restaurantId: RESTAURANT_ID,
      createdBy: ownerUser.id,
      isActive: true,
    },
  });

  await prisma.staff.upsert({
    where: { email: 'staff@northwind.table' },
    update: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'STAFF',
      isActive: true,
    },
    create: {
      email: 'staff@northwind.table',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'STAFF',
      restaurantId: RESTAURANT_ID,
      createdBy: ownerUser.id,
      isActive: true,
    },
  });

  // Create additional sample restaurants for display
  const additionalRestaurants = [
    {
      id: 'a1234567-89ab-cdef-0123-456789abcdef',
      brandName: 'Spice Route',
      cuisineTypes: ['South Asian', 'Indian', 'Contemporary'],
      city: 'San Francisco',
    },
    {
      id: 'b2345678-90bc-def1-2345-6789abcdef01',
      brandName: 'Green Leaf Café',
      cuisineTypes: ['Vegan', 'Healthy', 'Organic'],
      city: 'Oakland',
    },
    {
      id: 'c3456789-01cd-ef23-4567-89abcdef0123',
      brandName: 'Skyline Bistro',
      cuisineTypes: ['French', 'Continental', 'Fine Dining'],
      city: 'Berkeley',
    },
    {
      id: 'd4567890-12de-f345-6789-abcdef012345',
      brandName: 'Sunset Grill',
      cuisineTypes: ['American', 'BBQ', 'Steakhouse'],
      city: 'San Mateo',
    },
  ];

  for (const rest of additionalRestaurants) {
    await prisma.restaurant.upsert({
      where: { id: rest.id },
      update: {
        status: 'LIVE',
        isActive: true,
      },
      create: {
        id: rest.id,
        brandName: rest.brandName,
        legalBusinessName: rest.brandName + ' Inc.',
        cuisineTypes: rest.cuisineTypes,
        registeredAddress: {
          street: '123 Main Street',
          city: rest.city,
          state: 'CA',
          country: 'United States',
          zipCode: '94000',
        },
        operatingCountry: 'United States',
        timezone: 'America/Los_Angeles',
        planTier: 'Starter',
        primaryContact: {
          name: 'Manager',
          email: `info@${rest.brandName.toLowerCase().replace(/ /g, '')}`,
          phone: '+1-415-555-1234',
          designation: 'General Manager',
        },
        status: 'LIVE',
        isActive: true,
      },
    });

    // Add at least one branch to each restaurant
    const branchId = `${rest.id}-branch-1`;
    await prisma.branch.upsert({
      where: { id: branchId },
      update: {
        isActive: true,
        isLive: true,
      },
      create: {
        id: branchId,
        restaurantId: rest.id,
        name: `${rest.brandName} - Main`,
        address: {
          street: '123 Main Street',
          city: rest.city,
          state: 'CA',
          country: 'United States',
          zipCode: '94000',
        },
        timezone: 'America/Los_Angeles',
        phone: '+1-415-555-1234',
        email: `info@${rest.brandName.toLowerCase().replace(/ /g, '')}`,
        isActive: true,
        isLive: true,
      },
    });
  }

  console.log('✅ Admin user seeded:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
  console.log('✅ Owner user seeded:', OWNER_EMAIL, '/', OWNER_PASSWORD);
  console.log('✅ Guest user seeded:', GUEST_EMAIL, '/', GUEST_PASSWORD);
  console.log('✅ Sample restaurants created (5 total)');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
