ALTER TABLE rp_subscriptions ADD COLUMN IF NOT EXISTS last_retention_audit_at timestamptz;
