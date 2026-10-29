const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("VIP Store persists editable prices with safe defaults", () => {
  const migration = read("db/migrations/013_vip_store_settings.sql");
  const config = read("src/lib/vip-store.ts");
  assert.match(migration, /'vip_store'/);
  assert.match(config, /priceCents/);
  assert.match(config, /1_000_000/);
});

test("admin price changes require settings permission and are audited", () => {
  const route = read("src/app/api/admin/vip-store/route.ts");
  assert.match(route, /canManageSettings/);
  assert.match(route, /vip_store\.prices/);
  assert.match(route, /rp_audit/);
});

test("storefront and Stripe consume the same runtime plan configuration", () => {
  const portal = read("src/app/portal/page.tsx");
  const stripe = read("src/lib/stripe.ts");
  assert.match(portal, /\/api\/v1\/subscription\/plans/);
  assert.match(portal, /plans\[1\]\.monthlyPriceBRL/);
  assert.match(stripe, /getVipPlans/);
  assert.match(stripe, /unit_amount: Math\.round\(plan\.monthlyPriceBRL \* 100\)/);
});
