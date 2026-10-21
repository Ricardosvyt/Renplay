ALTER TABLE rp_users ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;
ALTER TABLE rp_users ADD COLUMN IF NOT EXISTS banned_until timestamptz;
ALTER TABLE rp_users ADD COLUMN IF NOT EXISTS ban_reason text;
CREATE INDEX IF NOT EXISTS rp_users_ban_idx ON rp_users (banned, banned_until);
