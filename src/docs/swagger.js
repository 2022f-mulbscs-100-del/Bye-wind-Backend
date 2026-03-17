const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Restaurant Reservation Platform API',
      version: '1.0.0',
      description:
        'Full backend API for the Restaurant Reservation & Table Management Platform. ' +
        'Covers all 16 onboarding sub-modules: Staff, Restaurant, Branch, Business Hours, ' +
        'Floor Plans, Tables, Table Config, Turn-Time, Reservation Policy, Payment Gateway, ' +
        'Communication, POS Integration, Data Import, Branding, Booking Widget, Audit Logs, Go-Live.',
      contact: { name: 'Platform Team' },
    },
    servers: [
      { url: 'http://localhost:3000/api/v1', description: 'Local Development' },
    ],
    tags: [
      { name: 'Auth / Staff',           description: 'Register, login, staff CRUD' },
      { name: 'Restaurant',             description: 'Restaurant onboarding' },
      { name: 'Branch',                 description: 'Branch management' },
      { name: 'Business Hours',         description: 'Schedule & holidays' },
      { name: 'Floor Plans',            description: 'Floor plans, zones, tables' },
      { name: 'Table Config',           description: 'Per-table configuration' },
      { name: 'Turn-Time Rules',        description: 'Dining duration rules' },
      { name: 'Reservation Policy',     description: 'Booking rules per branch' },
      { name: 'Payment Gateway',        description: 'Stripe / Square setup' },
      { name: 'Communication',          description: 'SMS / WhatsApp / Email channels' },
      { name: 'POS Integration',        description: 'POS system connections' },
      { name: 'Data Import',            description: 'Bulk guest/reservation imports' },
      { name: 'Branding',              description: 'White-label branding config' },
      { name: 'Booking Widget',         description: 'Public-facing widget config' },
      { name: 'Audit Logs',             description: 'Immutable audit trail' },
      { name: 'Go-Live',               description: 'Pre-launch checklist & activation' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from POST /staff/login',
        },
        RestaurantId: {
          type: 'apiKey',
          in: 'header',
          name: 'x-restaurant-id',
          description: 'Required for SUPER_ADMIN to target a specific restaurant',
        },
      },
      schemas: {
        // ── Reusable ──────────────────────────────────────────────
        Address: {
          type: 'object',
          required: ['street', 'city', 'state', 'zipCode', 'country'],
          properties: {
            street:  { type: 'string', example: '123 Main St' },
            city:    { type: 'string', example: 'Austin' },
            state:   { type: 'string', example: 'TX' },
            zipCode: { type: 'string', example: '78701' },
            country: { type: 'string', example: 'US' },
          },
        },
        Contact: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            name:        { type: 'string', example: 'Jane Doe' },
            email:       { type: 'string', format: 'email', example: 'jane@tacos.com' },
            phone:       { type: 'string', example: '+1-555-0100' },
            designation: { type: 'string', example: 'Owner' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors:  { type: 'array', items: { type: 'object' } },
          },
        },

        // ── Staff ─────────────────────────────────────────────────
        RegisterStaffBody: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'role'],
          properties: {
            email:        { type: 'string', format: 'email', example: 'owner@tacos.com' },
            password:     { type: 'string', minLength: 8,    example: 'Owner@1234' },
            firstName:    { type: 'string', example: 'Jane' },
            lastName:     { type: 'string', example: 'Doe' },
            phone:        { type: 'string', example: '+1-555-0100' },
            role:         { type: 'string', enum: ['SUPER_ADMIN', 'OWNER', 'HOST', 'STAFF'], example: 'OWNER' },
            restaurantId: { type: 'string', format: 'uuid',  example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                            description: 'Required for OWNER / HOST / STAFF. Omit for SUPER_ADMIN.' },
          },
        },
        LoginBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'owner@tacos.com' },
            password: { type: 'string', example: 'Owner@1234' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                staff: {
                  type: 'object',
                  properties: {
                    id:           { type: 'string', format: 'uuid' },
                    email:        { type: 'string' },
                    firstName:    { type: 'string' },
                    lastName:     { type: 'string' },
                    role:         { type: 'string' },
                    restaurantId: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
        },

        // ── Restaurant ────────────────────────────────────────────
        CreateRestaurantBody: {
          type: 'object',
          required: ['legalBusinessName', 'brandName', 'registeredAddress', 'operatingCountry', 'timezone', 'cuisineTypes', 'primaryContact'],
          properties: {
            legalBusinessName: { type: 'string', example: 'Taco Corp LLC' },
            brandName:         { type: 'string', example: 'Taco Palace' },
            registeredAddress: { $ref: '#/components/schemas/Address' },
            operatingCountry:  { type: 'string', example: 'US' },
            timezone:          { type: 'string', example: 'America/Chicago' },
            cuisineTypes:      { type: 'array', items: { type: 'string' }, example: ['Mexican', 'Tex-Mex'] },
            gstVatApplicable:  { type: 'boolean', example: false },
            gstVatNumber:      { type: 'string', nullable: true },
            primaryContact:    { $ref: '#/components/schemas/Contact' },
            logoUrl:           { type: 'string', format: 'uri', nullable: true },
          },
        },

        // ── Branch ────────────────────────────────────────────────
        CreateBranchBody: {
          type: 'object',
          required: ['name', 'address', 'timezone'],
          properties: {
            name:     { type: 'string', example: 'Downtown' },
            address:  { $ref: '#/components/schemas/Address' },
            timezone: { type: 'string', example: 'America/Chicago' },
            phone:    { type: 'string', example: '+1-555-0200' },
            email:    { type: 'string', format: 'email', example: 'downtown@tacos.com' },
          },
        },

        // ── Business Hours ────────────────────────────────────────
        ShiftBody: {
          type: 'object',
          required: ['name', 'shiftType', 'startTime', 'endTime'],
          properties: {
            name:      { type: 'string', example: 'Dinner' },
            shiftType: { type: 'string', enum: ['BREAKFAST','BRUNCH','LUNCH','DINNER','ALL_DAY'] },
            startTime: { type: 'string', example: '17:00' },
            endTime:   { type: 'string', example: '22:00' },
            isActive:  { type: 'boolean', default: true },
          },
        },
        BulkUpsertHoursBody: {
          type: 'object',
          required: ['branchId', 'schedule'],
          properties: {
            branchId: { type: 'string', format: 'uuid' },
            schedule: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  dayOfWeek: { type: 'string', enum: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] },
                  isOpen:    { type: 'boolean' },
                  openTime:  { type: 'string', example: '09:00' },
                  closeTime: { type: 'string', example: '22:00' },
                  shifts:    { type: 'array', items: { $ref: '#/components/schemas/ShiftBody' } },
                },
              },
              example: [
                { dayOfWeek: 'MONDAY', isOpen: true, openTime: '11:00', closeTime: '22:00',
                  shifts: [
                    { name: 'Lunch',  shiftType: 'LUNCH',  startTime: '11:00', endTime: '15:00' },
                    { name: 'Dinner', shiftType: 'DINNER', startTime: '17:00', endTime: '22:00' },
                  ]},
                { dayOfWeek: 'SUNDAY', isOpen: false },
              ],
            },
          },
        },
        CreateHolidayBody: {
          type: 'object',
          required: ['branchId', 'name', 'startDate', 'type'],
          properties: {
            branchId:    { type: 'string', format: 'uuid' },
            name:        { type: 'string', example: 'Thanksgiving' },
            startDate:   { type: 'string', format: 'date-time', example: '2026-11-26T00:00:00Z' },
            endDate:     { type: 'string', format: 'date-time', nullable: true },
            type:        { type: 'string', enum: ['PUBLIC_HOLIDAY','SEASONAL_CLOSURE','ADHOC_BLACKOUT'] },
            description: { type: 'string', nullable: true },
            isRecurring: { type: 'boolean', default: false },
          },
        },

        // ── Floor Plans ───────────────────────────────────────────
        CreateFloorPlanBody: {
          type: 'object',
          required: ['branchId', 'name'],
          properties: {
            branchId:     { type: 'string', format: 'uuid' },
            name:         { type: 'string', example: 'Main Dining' },
            description:  { type: 'string', nullable: true },
            canvasWidth:  { type: 'number', example: 1200 },
            canvasHeight: { type: 'number', example: 800 },
          },
        },
        CreateZoneBody: {
          type: 'object',
          required: ['floorPlanId', 'name', 'type'],
          properties: {
            floorPlanId: { type: 'string', format: 'uuid' },
            name:        { type: 'string', example: 'Patio' },
            type:        { type: 'string', enum: ['INDOOR','OUTDOOR','BAR','PRIVATE_DINING','TERRACE','ROOFTOP'] },
            color:       { type: 'string', example: '#A8D8A8' },
            description: { type: 'string', nullable: true },
          },
        },
        CreateTableBody: {
          type: 'object',
          required: ['floorPlanId', 'tableNumber', 'capacity'],
          properties: {
            floorPlanId:  { type: 'string', format: 'uuid' },
            zoneId:       { type: 'string', format: 'uuid', nullable: true },
            tableNumber:  { type: 'string', example: 'T-01' },
            label:        { type: 'string', nullable: true },
            shape:        { type: 'string', enum: ['ROUND','SQUARE','RECTANGLE','OVAL','CUSTOM'], default: 'SQUARE' },
            capacity:     { type: 'integer', example: 4 },
            width:        { type: 'number', example: 70 },
            height:       { type: 'number', example: 70 },
            positionX:    { type: 'number', example: 150 },
            positionY:    { type: 'number', example: 200 },
            rotation:     { type: 'number', example: 0 },
          },
        },

        // ── Table Config ──────────────────────────────────────────
        CreateTableConfigBody: {
          type: 'object',
          required: ['tableId', 'maxPartySize'],
          properties: {
            tableId:        { type: 'string', format: 'uuid' },
            minPartySize:   { type: 'integer', default: 1 },
            maxPartySize:   { type: 'integer', example: 4 },
            isCombinable:   { type: 'boolean', default: false },
            combinableWith: { type: 'array', items: { type: 'string', format: 'uuid' } },
            isAccessible:   { type: 'boolean', default: false },
            isVIP:          { type: 'boolean', default: false },
            isSmoking:      { type: 'boolean', default: false },
            preferredTags:  { type: 'array', items: { type: 'string' }, example: ['window','quiet'] },
            notes:          { type: 'string', nullable: true },
          },
        },

        // ── Turn Time ─────────────────────────────────────────────
        CreateTurnTimeBody: {
          type: 'object',
          required: ['branchId', 'durationMins'],
          properties: {
            branchId:     { type: 'string', format: 'uuid' },
            name:         { type: 'string', nullable: true },
            partySizeMin: { type: 'integer', nullable: true },
            partySizeMax: { type: 'integer', nullable: true },
            mealType:     { type: 'string', enum: ['BREAKFAST','BRUNCH','LUNCH','DINNER'], nullable: true },
            dayOfWeek:    { type: 'string', enum: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'], nullable: true },
            timeSlotFrom: { type: 'string', example: '18:00', nullable: true },
            timeSlotTo:   { type: 'string', example: '21:00', nullable: true },
            durationMins: { type: 'integer', example: 90 },
            isDefault:    { type: 'boolean', default: false },
            priority:     { type: 'integer', default: 0 },
          },
        },

        // ── Reservation Policy ────────────────────────────────────
        CreateReservationPolicyBody: {
          type: 'object',
          required: ['branchId'],
          properties: {
            branchId:                  { type: 'string', format: 'uuid' },
            minPartySize:              { type: 'integer', default: 1 },
            maxPartySize:              { type: 'integer', default: 20 },
            advanceBookingDays:        { type: 'integer', default: 30 },
            sameDayCutoffMins:         { type: 'integer', default: 60 },
            minNoticeMins:             { type: 'integer', default: 30 },
            overbookingTolerancePct:   { type: 'number',  default: 0 },
            depositRequired:           { type: 'boolean', default: false },
            depositType:               { type: 'string', enum: ['FIXED','PER_HEAD','PERCENTAGE'], nullable: true },
            depositAmount:             { type: 'number', nullable: true },
            cancellationWindowHours:   { type: 'integer', default: 24 },
            noShowPenaltyEnabled:      { type: 'boolean', default: false },
            noShowPenaltyAmount:       { type: 'number', nullable: true },
            modificationLimitHours:    { type: 'integer', default: 24 },
            autoConfirm:               { type: 'boolean', default: true },
            maxBookingsPerSlot:        { type: 'integer', nullable: true },
            notes:                     { type: 'string', nullable: true },
          },
        },

        // ── Payment Gateway ───────────────────────────────────────
        CreatePaymentGatewayBody: {
          type: 'object',
          required: ['provider', 'apiKey', 'secretKey'],
          properties: {
            provider:      { type: 'string', enum: ['STRIPE','SQUARE'] },
            apiKey:        { type: 'string', example: 'pk_test_xxx' },
            secretKey:     { type: 'string', example: 'sk_test_xxx' },
            webhookSecret: { type: 'string', nullable: true },
            currency:      { type: 'string', example: 'USD', default: 'USD' },
            isTestMode:    { type: 'boolean', default: true },
            taxRate:       { type: 'number', nullable: true },
          },
        },

        // ── Communication ─────────────────────────────────────────
        CreateCommunicationBody: {
          type: 'object',
          required: ['channel', 'provider', 'apiKey', 'senderId'],
          properties: {
            channel:   { type: 'string', enum: ['SMS','WHATSAPP','EMAIL'] },
            provider:  { type: 'string', example: 'Twilio' },
            apiKey:    { type: 'string', example: 'ACxxx' },
            apiSecret: { type: 'string', nullable: true },
            senderId:  { type: 'string', example: '+1-555-9999' },
            fromName:  { type: 'string', nullable: true, example: 'Taco Palace' },
          },
        },

        // ── POS Integration ───────────────────────────────────────
        CreatePOSBody: {
          type: 'object',
          required: ['provider', 'apiKey'],
          properties: {
            branchId:          { type: 'string', format: 'uuid', nullable: true },
            provider:          { type: 'string', enum: ['TOAST','LIGHTSPEED','SQUARE_POS','CLOVER','REVEL','OTHER'] },
            apiKey:            { type: 'string', example: 'toast_key_xxx' },
            apiSecret:         { type: 'string', nullable: true },
            endpointUrl:       { type: 'string', format: 'uri', nullable: true },
            syncFrequencyMins: { type: 'integer', default: 15 },
            syncDirection:     { type: 'string', enum: ['INBOUND','OUTBOUND','BIDIRECTIONAL'], default: 'BIDIRECTIONAL' },
          },
        },

        // ── Data Import ───────────────────────────────────────────
        CreateDataImportBody: {
          type: 'object',
          required: ['importType', 'fileName', 'fileUrl'],
          properties: {
            branchId:     { type: 'string', format: 'uuid', nullable: true },
            importType:   { type: 'string', enum: ['GUESTS','RESERVATIONS','TABLES'] },
            fileName:     { type: 'string', example: 'guests_march_2026.csv' },
            fileUrl:      { type: 'string', format: 'uri', example: 'https://s3.example.com/guests.csv' },
            mappingConfig:{ type: 'object', example: { name: 'Full Name', email: 'Email Address' } },
          },
        },

        // ── Branding ──────────────────────────────────────────────
        UpsertBrandingBody: {
          type: 'object',
          properties: {
            logoUrl:            { type: 'string', format: 'uri', nullable: true },
            faviconUrl:         { type: 'string', format: 'uri', nullable: true },
            primaryColor:       { type: 'string', example: '#E63946' },
            secondaryColor:     { type: 'string', example: '#457B9D' },
            accentColor:        { type: 'string', example: '#F1FAEE' },
            fontFamily:         { type: 'string', example: 'Inter' },
            isWhiteLabel:       { type: 'boolean', default: false },
            customDomain:       { type: 'string', nullable: true, example: 'reservations.tacopalace.com' },
            emailTemplates:     { type: 'object' },
            smsTemplates:       { type: 'object' },
            whatsappTemplates:  { type: 'object' },
            widgetTheme:        { type: 'object' },
            customCSSUrl:       { type: 'string', format: 'uri', nullable: true },
          },
        },

        // ── Booking Widget ────────────────────────────────────────
        CreateBookingWidgetBody: {
          type: 'object',
          required: ['name'],
          properties: {
            branchId:       { type: 'string', format: 'uuid', nullable: true },
            name:           { type: 'string', example: 'Main Site Widget' },
            language:       { type: 'string', default: 'en' },
            timezone:       { type: 'string', example: 'America/Chicago', nullable: true },
            minPartySize:   { type: 'integer', default: 1 },
            maxPartySize:   { type: 'integer', default: 20 },
            availableZones: { type: 'array', items: { type: 'string', format: 'uuid' } },
            bookingRules:   { type: 'object' },
            customStyles:   { type: 'object' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: [], // We define paths inline below
};

// ── Inline path definitions ──────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc(options);

// ── Manually inject all paths ────────────────────────────────────────────────
swaggerSpec.paths = {

  // ════════════════════════════════════════════════════════════════
  // AUTH / STAFF
  // ════════════════════════════════════════════════════════════════
  '/staff/register': {
    post: {
      tags: ['Auth / Staff'],
      summary: 'Register a new staff member',
      security: [],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterStaffBody' } } } },
      responses: {
        201: { description: 'Staff registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        409: { description: 'Email already registered' },
      },
    },
  },
  '/staff/login': {
    post: {
      tags: ['Auth / Staff'],
      summary: 'Login — returns JWT token',
      security: [],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } } },
      responses: {
        200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        401: { description: 'Invalid credentials' },
      },
    },
  },
  '/staff': {
    get: {
      tags: ['Auth / Staff'],
      summary: 'Get all staff (OWNER only)',
      parameters: [
        { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
      ],
      responses: { 200: { description: 'List of staff' }, 403: { description: 'Forbidden' } },
    },
  },
  '/staff/{id}': {
    get: {
      tags: ['Auth / Staff'],
      summary: 'Get staff by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Staff record' }, 404: { description: 'Not found' } },
    },
    put: {
      tags: ['Auth / Staff'],
      summary: 'Update staff member (OWNER only)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                firstName: { type: 'string' }, lastName: { type: 'string' },
                phone: { type: 'string' }, role: { type: 'string', enum: ['OWNER','HOST','STAFF'] },
                isActive: { type: 'boolean' }, permissions: { type: 'object' },
              },
            },
          },
        },
      },
      responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } },
    },
  },
  '/staff/branches': {
    post: {
      tags: ['Auth / Staff'],
      summary: 'Assign staff to a branch',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object', required: ['staffId', 'branchId'],
              properties: {
                staffId:   { type: 'string', format: 'uuid' },
                branchId:  { type: 'string', format: 'uuid' },
                isPrimary: { type: 'boolean', default: false },
              },
            },
          },
        },
      },
      responses: { 201: { description: 'Assignment created' } },
    },
  },
  '/staff/{staffId}/branches/{branchId}': {
    delete: {
      tags: ['Auth / Staff'],
      summary: 'Remove staff from a branch',
      parameters: [
        { name: 'staffId',  in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'branchId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: { 200: { description: 'Removed' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // RESTAURANT
  // ════════════════════════════════════════════════════════════════
  '/restaurants': {
    post: {
      tags: ['Restaurant'],
      summary: 'Create a new restaurant (OWNER / SUPER_ADMIN)',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRestaurantBody' } } } },
      responses: { 201: { description: 'Restaurant created' }, 400: { description: 'Validation error' } },
    },
    get: {
      tags: ['Restaurant'],
      summary: 'Get all restaurants',
      description:
        '**SUPER_ADMIN**: returns all restaurants with pagination and optional search.\n\n' +
        '**OWNER / HOST / STAFF**: returns only their own restaurant.',
      parameters: [
        { name: 'page',     in: 'query', schema: { type: 'integer', default: 1 },   description: 'Page number' },
        { name: 'limit',    in: 'query', schema: { type: 'integer', default: 20 },  description: 'Results per page (max 100)' },
        { name: 'search',   in: 'query', schema: { type: 'string' },                description: 'Search by brand name, legal name or country (SUPER_ADMIN only)' },
        { name: 'isActive', in: 'query', schema: { type: 'boolean' },               description: 'Filter by active status (SUPER_ADMIN only)' },
      ],
      responses: {
        200: {
          description: 'Restaurant list with pagination meta',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string',  example: 'Restaurants fetched successfully' },
                  data:    { type: 'array',   items: { type: 'object' } },
                  meta: {
                    type: 'object',
                    properties: {
                      total:      { type: 'integer', example: 42 },
                      page:       { type: 'integer', example: 1 },
                      limit:      { type: 'integer', example: 20 },
                      totalPages: { type: 'integer', example: 3 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/restaurants/{id}': {
    get: {
      tags: ['Restaurant'],
      summary: 'Get restaurant by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Restaurant record' }, 404: { description: 'Not found' } },
    },
    put: {
      tags: ['Restaurant'],
      summary: 'Update restaurant',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRestaurantBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Restaurant'],
      summary: 'Delete restaurant (OWNER / SUPER_ADMIN)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // BRANCH
  // ════════════════════════════════════════════════════════════════
  '/branches': {
    post: {
      tags: ['Branch'],
      summary: 'Create a branch',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBranchBody' } } } },
      responses: { 201: { description: 'Branch created' } },
    },
    get: {
      tags: ['Branch'],
      summary: 'List all branches for the restaurant',
      responses: { 200: { description: 'Branch list' } },
    },
  },
  '/branches/{id}': {
    get: {
      tags: ['Branch'],
      summary: 'Get branch by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Branch record' } },
    },
    put: {
      tags: ['Branch'],
      summary: 'Update branch',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBranchBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Branch'],
      summary: 'Delete branch',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // BUSINESS HOURS
  // ════════════════════════════════════════════════════════════════
  '/business-hours': {
    get: {
      tags: ['Business Hours'],
      summary: 'Get business hours schedule',
      parameters: [{ name: 'branchId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Schedule data' } },
    },
  },
  '/business-hours/bulk': {
    put: {
      tags: ['Business Hours'],
      summary: 'Bulk upsert weekly schedule',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkUpsertHoursBody' } } } },
      responses: { 200: { description: 'Schedule saved' } },
    },
  },
  '/business-hours/holidays': {
    get: {
      tags: ['Business Hours'],
      summary: 'Get holidays for a branch',
      parameters: [{ name: 'branchId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Holiday list' } },
    },
    post: {
      tags: ['Business Hours'],
      summary: 'Create a holiday / blackout',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateHolidayBody' } } } },
      responses: { 201: { description: 'Holiday created' } },
    },
  },
  '/business-hours/holidays/{id}': {
    put: {
      tags: ['Business Hours'],
      summary: 'Update holiday',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateHolidayBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Business Hours'],
      summary: 'Delete holiday',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // FLOOR PLANS
  // ════════════════════════════════════════════════════════════════
  '/floor-plans': {
    post: {
      tags: ['Floor Plans'],
      summary: 'Create a floor plan',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateFloorPlanBody' } } } },
      responses: { 201: { description: 'Floor plan created' } },
    },
    get: {
      tags: ['Floor Plans'],
      summary: 'Get all floor plans for a branch',
      parameters: [{ name: 'branchId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Floor plan list' } },
    },
  },
  '/floor-plans/{id}': {
    get: {
      tags: ['Floor Plans'],
      summary: 'Get floor plan by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Floor plan record' } },
    },
    put: {
      tags: ['Floor Plans'],
      summary: 'Update floor plan',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateFloorPlanBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Floor Plans'],
      summary: 'Delete floor plan',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },
  '/floor-plans/zones': {
    post: {
      tags: ['Floor Plans'],
      summary: 'Create a zone',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateZoneBody' } } } },
      responses: { 201: { description: 'Zone created' } },
    },
  },
  '/floor-plans/zones/{id}': {
    put: {
      tags: ['Floor Plans'],
      summary: 'Update zone',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateZoneBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Floor Plans'],
      summary: 'Delete zone',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },
  '/floor-plans/tables': {
    post: {
      tags: ['Floor Plans'],
      summary: 'Create a table',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTableBody' } } } },
      responses: { 201: { description: 'Table created' } },
    },
  },
  '/floor-plans/tables/bulk/positions': {
    put: {
      tags: ['Floor Plans'],
      summary: 'Bulk update table positions (drag-and-drop)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                tables: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      positionX: { type: 'number' }, positionY: { type: 'number' },
                      rotation:  { type: 'number' }, width: { type: 'number' }, height: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: { 200: { description: 'Positions updated' } },
    },
  },
  '/floor-plans/tables/{id}': {
    get: {
      tags: ['Floor Plans'],
      summary: 'Get table by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Table record' } },
    },
    put: {
      tags: ['Floor Plans'],
      summary: 'Update table',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTableBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Floor Plans'],
      summary: 'Delete table',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // TABLE CONFIG
  // ════════════════════════════════════════════════════════════════
  '/table-configs': {
    post: {
      tags: ['Table Config'],
      summary: 'Create or upsert table configuration',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTableConfigBody' } } } },
      responses: { 201: { description: 'Config created/updated' } },
    },
  },
  '/table-configs/table/{tableId}': {
    get: {
      tags: ['Table Config'],
      summary: 'Get config for a specific table',
      parameters: [{ name: 'tableId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Table config' } },
    },
  },
  '/table-configs/{id}': {
    put: {
      tags: ['Table Config'],
      summary: 'Update table config',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTableConfigBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Table Config'],
      summary: 'Delete table config',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // TURN-TIME RULES
  // ════════════════════════════════════════════════════════════════
  '/turn-times': {
    post: {
      tags: ['Turn-Time Rules'],
      summary: 'Create a turn-time rule',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTurnTimeBody' } } } },
      responses: { 201: { description: 'Rule created' } },
    },
    get: {
      tags: ['Turn-Time Rules'],
      summary: 'Get all turn-time rules for a branch',
      parameters: [{ name: 'branchId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Rules list' } },
    },
  },
  '/turn-times/{id}': {
    put: {
      tags: ['Turn-Time Rules'],
      summary: 'Update turn-time rule',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTurnTimeBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Turn-Time Rules'],
      summary: 'Delete turn-time rule',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // RESERVATION POLICY
  // ════════════════════════════════════════════════════════════════
  '/reservation-policies': {
    post: {
      tags: ['Reservation Policy'],
      summary: 'Create reservation policy for a branch',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateReservationPolicyBody' } } } },
      responses: { 201: { description: 'Policy created' } },
    },
    get: {
      tags: ['Reservation Policy'],
      summary: 'Get policy for a branch',
      parameters: [{ name: 'branchId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Policy data' } },
    },
  },
  '/reservation-policies/{id}': {
    put: {
      tags: ['Reservation Policy'],
      summary: 'Update reservation policy',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateReservationPolicyBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // PAYMENT GATEWAY
  // ════════════════════════════════════════════════════════════════
  '/payment-gateways': {
    post: {
      tags: ['Payment Gateway'],
      summary: 'Add a payment gateway (OWNER only)',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePaymentGatewayBody' } } } },
      responses: { 201: { description: 'Gateway created' } },
    },
    get: {
      tags: ['Payment Gateway'],
      summary: 'List payment gateways',
      responses: { 200: { description: 'Gateway list' } },
    },
  },
  '/payment-gateways/{id}': {
    put: {
      tags: ['Payment Gateway'],
      summary: 'Update payment gateway',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePaymentGatewayBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Payment Gateway'],
      summary: 'Delete payment gateway',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // COMMUNICATION CHANNELS
  // ════════════════════════════════════════════════════════════════
  '/communication-channels': {
    post: {
      tags: ['Communication'],
      summary: 'Add a communication channel',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCommunicationBody' } } } },
      responses: { 201: { description: 'Channel created' } },
    },
    get: {
      tags: ['Communication'],
      summary: 'List communication channels',
      responses: { 200: { description: 'Channel list' } },
    },
  },
  '/communication-channels/{id}': {
    put: {
      tags: ['Communication'],
      summary: 'Update communication channel',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCommunicationBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Communication'],
      summary: 'Delete communication channel',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // POS INTEGRATION
  // ════════════════════════════════════════════════════════════════
  '/pos-integrations': {
    post: {
      tags: ['POS Integration'],
      summary: 'Create POS integration',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePOSBody' } } } },
      responses: { 201: { description: 'Integration created' } },
    },
    get: {
      tags: ['POS Integration'],
      summary: 'List POS integrations',
      responses: { 200: { description: 'POS list' } },
    },
  },
  '/pos-integrations/{id}': {
    put: {
      tags: ['POS Integration'],
      summary: 'Update POS integration',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePOSBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['POS Integration'],
      summary: 'Delete POS integration',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // DATA IMPORT
  // ════════════════════════════════════════════════════════════════
  '/data-imports': {
    post: {
      tags: ['Data Import'],
      summary: 'Start a data import job',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDataImportBody' } } } },
      responses: { 201: { description: 'Import job created' } },
    },
    get: {
      tags: ['Data Import'],
      summary: 'List all import jobs',
      responses: { 200: { description: 'Import list' } },
    },
  },
  '/data-imports/{id}': {
    get: {
      tags: ['Data Import'],
      summary: 'Get import job by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Import record' } },
    },
  },
  '/data-imports/{id}/confirm': {
    post: {
      tags: ['Data Import'],
      summary: 'Confirm and execute import',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Import confirmed' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // BRANDING
  // ════════════════════════════════════════════════════════════════
  '/branding': {
    get: {
      tags: ['Branding'],
      summary: 'Get branding config',
      responses: { 200: { description: 'Branding data' } },
    },
    put: {
      tags: ['Branding'],
      summary: 'Create or update branding (upsert)',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpsertBrandingBody' } } } },
      responses: { 200: { description: 'Branding saved' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // BOOKING WIDGET
  // ════════════════════════════════════════════════════════════════
  '/booking-widgets': {
    post: {
      tags: ['Booking Widget'],
      summary: 'Create a booking widget',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBookingWidgetBody' } } } },
      responses: { 201: { description: 'Widget created' } },
    },
    get: {
      tags: ['Booking Widget'],
      summary: 'List booking widgets',
      responses: { 200: { description: 'Widget list' } },
    },
  },
  '/booking-widgets/{id}': {
    get: {
      tags: ['Booking Widget'],
      summary: 'Get widget by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Widget record' } },
    },
    put: {
      tags: ['Booking Widget'],
      summary: 'Update widget',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBookingWidgetBody' } } } },
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Booking Widget'],
      summary: 'Delete widget',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Deleted' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // AUDIT LOGS
  // ════════════════════════════════════════════════════════════════
  '/audit-logs': {
    get: {
      tags: ['Audit Logs'],
      summary: 'Query audit logs (OWNER only)',
      parameters: [
        { name: 'entity', in: 'query', schema: { type: 'string', example: 'Staff' } },
        { name: 'action', in: 'query', schema: { type: 'string', enum: ['CREATE','UPDATE','DELETE'] } },
        { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit',  in: 'query', schema: { type: 'integer', default: 20 } },
      ],
      responses: { 200: { description: 'Audit log entries' } },
    },
  },
  '/audit-logs/{id}': {
    get: {
      tags: ['Audit Logs'],
      summary: 'Get audit log entry by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Audit entry' } },
    },
  },

  // ════════════════════════════════════════════════════════════════
  // GO-LIVE
  // ════════════════════════════════════════════════════════════════
  '/go-live/{restaurantId}': {
    get: {
      tags: ['Go-Live'],
      summary: 'Get go-live checklist status',
      parameters: [{ name: 'restaurantId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: { 200: { description: 'Checklist status' } },
    },
  },
  '/go-live/{restaurantId}/activate': {
    post: {
      tags: ['Go-Live'],
      summary: 'Activate restaurant (flip go-live switch)',
      parameters: [{ name: 'restaurantId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Restaurant activated' },
        400: { description: 'Checklist incomplete' },
      },
    },
  },
};

module.exports = swaggerSpec;
