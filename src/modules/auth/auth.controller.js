const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const ApiError = require('../../shared/utils/ApiError');
const asyncHandler = require('../../shared/utils/asyncHandler');

const prisma = new PrismaClient();

const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create new user with GUEST role
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      phone: phone || null,
      role: 'GUEST',
      isActive: true,
    },
  });

  // Also create a Guest record for the guest profile
  await prisma.guestProfile.create({
    data: {
      email,
      name: `${firstName} ${lastName}`,
      phone: phone || null,
      memberSince: new Date(), // schema says DateTime, not string
      totalBookings: 0,
      totalSpent: 0,
    }
  });

  // Build token payload
  let tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  // If user has a restaurant (shouldn't happen at signup, but for completeness)
  if (user.role === 'OWNER') {
    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (restaurant) {
      tokenPayload.restaurantId = restaurant.id;
    }
  }

  // Generate JWT token
  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Return user data and token
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    if (!user.isActive) {
      throw ApiError.unauthorized('Account is deactivated');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // For OWNER users, get their restaurant ID
    let tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    if (user.role === 'OWNER') {
      const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: user.id },
        select: { id: true },
      });
      if (restaurant) {
        tokenPayload.restaurantId = restaurant.id;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data and token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          ...(tokenPayload.restaurantId && { restaurantId: tokenPayload.restaurantId }),
        },
        token,
      },
    });
  }

  // Not a user, fallback to staff
  const staff = await prisma.staff.findUnique({
    where: { email }
  });

  if (staff) {
    if (!staff.isActive) {
      throw ApiError.unauthorized('Account is deactivated');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, staff.passwordHash);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    await prisma.staff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    let tokenPayload = {
      staffId: staff.id,
      restaurantId: staff.restaurantId,
      role: staff.role
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: staff.id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          role: staff.role,
          restaurantId: staff.restaurantId
        },
        token,
      },
    });
  }

  throw ApiError.unauthorized('Invalid email or password');
});

const registerRestaurant = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw ApiError.unauthorized('No token provided');
  }

  // Verify and decode JWT
  let decoded;
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const userId = decoded.userId;
  const {
    brandName,
    legalBusinessName,
    cuisineTypes,
    street,
    city,
    state,
    country,
    zipCode,
    timezone,
    phone,
  } = req.body;

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role !== 'GUEST') {
    throw ApiError.forbidden('Only guest users can register restaurants');
  }

  // Check if user already owns a restaurant
  const existingRestaurant = await prisma.restaurant.findFirst({
    where: { ownerId: userId },
  });

  if (existingRestaurant) {
    throw ApiError.conflict('User already owns a restaurant');
  }

  // Create restaurant owned by this user
  const restaurant = await prisma.restaurant.create({
    data: {
      brandName,
      legalBusinessName,
      cuisineTypes,
      registeredAddress: {
        street,
        city,
        state,
        country,
        zipCode,
      },
      operatingCountry: country,
      timezone: timezone || 'UTC',
      primaryContact: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: phone || '',
        designation: 'Owner',
      },
      status: 'DRAFT',
      isActive: true,
      ownerId: userId,
      goLiveChecklist: {
        create: {
          restaurantProfileDone: true,
        }
      }
    },
  });

  // Update user role to OWNER
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: 'OWNER' },
  });

  // Generate new JWT token with OWNER role
  const newToken = jwt.sign(
    {
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      restaurantId: restaurant.id,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.status(201).json({
    success: true,
    message: 'Restaurant registered successfully',
    data: {
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      restaurant: {
        id: restaurant.id,
        brandName: restaurant.brandName,
        legalBusinessName: restaurant.legalBusinessName,
        status: restaurant.status,
      },
      token: newToken,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  let updated;
  if (req.isUserAuth) {
    updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone }
    });
  } else {
    updated = await prisma.staff.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone }
    });
  }
  
  res.status(200).json({
    success: true,
    data: updated
  });
});

module.exports = {
  signup,
  login,
  registerRestaurant,
  getMe,
  updateMe,
};
