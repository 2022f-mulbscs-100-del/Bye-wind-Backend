// ══════════════════════════════════════════════════════════════════════
// Application-wide constants
// ══════════════════════════════════════════════════════════════════════

/**
 * Role Definitions:
 * ─────────────────────────────────────────────────────────────────────
 * SUPER_ADMIN  → Platform-level. Full access to ALL restaurants.
 *                Not tied to any single restaurant (restaurantId = null).
 *                Bypasses all permission checks + tenant isolation.
 *
 * OWNER        → Restaurant-level. Full access to their OWN restaurant.
 *                Manages all settings, staff, billing, go-live, etc.
 *
 * HOST         → Front-of-house. Manages reservations, guests, floor plan
 *                views, business hours (read), and booking widgets.
 *
 * STAFF        → Kitchen / Waitstaff. Views tables, orders, floor plans.
 *                Read-only access to operational data.
 */
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  HOST: 'HOST',
  STAFF: 'STAFF',
};

// ── Permission matrix ───────────────────────────────────────────────
// SUPER_ADMIN is NOT listed here — it bypasses all checks in the
// authorize() middleware. Only OWNER / HOST / STAFF are mapped.
// ─────────────────────────────────────────────────────────────────────
const PERMISSIONS = {
  // ── Restaurant & Branch ────────────────────────────────────────────
  'restaurant:read':    [ROLES.OWNER, ROLES.HOST, ROLES.STAFF],
  'restaurant:write':   [ROLES.OWNER],
  'branch:read':        [ROLES.OWNER, ROLES.HOST, ROLES.STAFF],
  'branch:write':       [ROLES.OWNER],

  // ── Business Hours & Holidays ─────────────────────────────────────
  'hours:read':         [ROLES.OWNER, ROLES.HOST, ROLES.STAFF],
  'hours:write':        [ROLES.OWNER],

  // ── Floor Plans & Tables ──────────────────────────────────────────
  'floor-plan:read':    [ROLES.OWNER, ROLES.HOST, ROLES.STAFF],
  'floor-plan:write':   [ROLES.OWNER],
  'table-config:read':  [ROLES.OWNER, ROLES.HOST, ROLES.STAFF],
  'table-config:write': [ROLES.OWNER, ROLES.STAFF],

  // ── Turn Time & Reservation Policy ────────────────────────────────
  'turn-time:read':     [ROLES.OWNER, ROLES.HOST],
  'turn-time:write':    [ROLES.OWNER],
  'policy:read':        [ROLES.OWNER, ROLES.HOST],
  'policy:write':       [ROLES.OWNER],

  // ── Reservations & Guests (future module, permissions ready) ──────
  'reservation:read':   [ROLES.OWNER, ROLES.HOST],
  'reservation:write':  [ROLES.OWNER, ROLES.HOST],
  'guest:read':         [ROLES.OWNER, ROLES.HOST],
  'guest:write':        [ROLES.OWNER, ROLES.HOST],

  // ── Orders (future module, permissions ready) ─────────────────────
  'order:read':         [ROLES.OWNER, ROLES.HOST, ROLES.STAFF],
  'order:write':        [ROLES.OWNER, ROLES.STAFF],

  // ── Staff Management ──────────────────────────────────────────────
  'staff:read':         [ROLES.OWNER],
  'staff:write':        [ROLES.OWNER],

  // ── Payment & Communication ───────────────────────────────────────
  'payment:read':       [ROLES.OWNER],
  'payment:write':      [ROLES.OWNER],
  'communication:read': [ROLES.OWNER],
  'communication:write':[ROLES.OWNER],

  // ── POS Integration ───────────────────────────────────────────────
  'pos:read':           [ROLES.OWNER],
  'pos:write':          [ROLES.OWNER],

  // ── Menu Management ───────────────────────────────────────────────
  'menu:read':          [ROLES.OWNER, ROLES.HOST, ROLES.STAFF],
  'menu:write':         [ROLES.OWNER],

  // ── Data Import ───────────────────────────────────────────────────
  'import:read':        [ROLES.OWNER],
  'import:write':       [ROLES.OWNER],

  // ── Branding ──────────────────────────────────────────────────────
  'branding:read':      [ROLES.OWNER],
  'branding:write':     [ROLES.OWNER],

  // ── Booking Widget ────────────────────────────────────────────────
  'widget:read':        [ROLES.OWNER, ROLES.HOST],
  'widget:write':       [ROLES.OWNER],

  // ── Audit Logs ────────────────────────────────────────────────────
  'audit:read':         [ROLES.OWNER],

  // ── Go-Live ───────────────────────────────────────────────────────
  'go-live:read':       [ROLES.OWNER],
  'go-live:write':      [ROLES.OWNER],
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  PERMISSIONS,
  PAGINATION,
};
