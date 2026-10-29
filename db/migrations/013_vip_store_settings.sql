INSERT INTO rp_settings(key, value) VALUES (
  'vip_store',
  '{"enabled":true,"currency":"brl","priceCents":{"1":1490,"2":2490,"3":3990}}'::jsonb
) ON CONFLICT (key) DO NOTHING;
