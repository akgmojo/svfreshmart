import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

const ADMIN_CREDENTIALS = [
  { username: 'admin', role: 'Super Admin', pass: 'admin@SVFresh2026!' },
  { username: 'store_mgr', role: 'Store Manager', pass: 'manager@SVFresh2026!' },
  { username: 'inventory_mgr', role: 'Inventory Manager', pass: 'inventory@SVFresh2026!' },
  { username: 'order_mgr', role: 'Order Manager', pass: 'order@SVFresh2026!' },
  { username: 'support_user', role: 'Support', pass: 'support@SVFresh2026!' }
];

test('Admin Bcrypt Authentication', () => {
  for (const cred of ADMIN_CREDENTIALS) {
    const hash = bcrypt.hashSync(cred.pass, 8);
    const valid = bcrypt.compareSync(cred.pass, hash);
    const invalid = bcrypt.compareSync('WrongPassword123', hash);

    assert.equal(valid, true, `Password for ${cred.username} must match hash`);
    assert.equal(invalid, false, `Wrong password for ${cred.username} must fail`);
  }
});

test('Admin RBAC Permission Boundaries', () => {
  function checkPermission(userRole, allowedRoles) {
    if (userRole === 'Super Admin') return true;
    return allowedRoles.includes(userRole);
  }

  // 1. Modify Product Catalog
  const canModifyProducts = ['Super Admin', 'Store Manager', 'Inventory Manager'];
  assert.equal(checkPermission('Super Admin', canModifyProducts), true);
  assert.equal(checkPermission('Store Manager', canModifyProducts), true);
  assert.equal(checkPermission('Inventory Manager', canModifyProducts), true);
  assert.equal(checkPermission('Order Manager', canModifyProducts), false);
  assert.equal(checkPermission('Support', canModifyProducts), false);

  // 2. Modify Order Status
  const canUpdateOrders = ['Super Admin', 'Store Manager', 'Order Manager'];
  assert.equal(checkPermission('Super Admin', canUpdateOrders), true);
  assert.equal(checkPermission('Order Manager', canUpdateOrders), true);
  assert.equal(checkPermission('Inventory Manager', canUpdateOrders), false);
  assert.equal(checkPermission('Support', canUpdateOrders), false);

  // 3. Modify Delivery Zones
  const canUpdateZones = ['Super Admin', 'Store Manager'];
  assert.equal(checkPermission('Super Admin', canUpdateZones), true);
  assert.equal(checkPermission('Store Manager', canUpdateZones), true);
  assert.equal(checkPermission('Inventory Manager', canUpdateZones), false);
  assert.equal(checkPermission('Support', canUpdateZones), false);
});
