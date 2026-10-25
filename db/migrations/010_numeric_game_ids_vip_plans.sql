-- Public numeric game IDs keep existing text primary keys and all save/object
-- references intact. New rows receive a number automatically.
CREATE SEQUENCE IF NOT EXISTS rp_game_public_id_seq START WITH 100001;
ALTER TABLE rp_games ADD COLUMN IF NOT EXISTS public_id bigint;
ALTER TABLE rp_games ALTER COLUMN public_id SET DEFAULT nextval('rp_game_public_id_seq');
UPDATE rp_games SET public_id = nextval('rp_game_public_id_seq') WHERE public_id IS NULL;
ALTER TABLE rp_games ALTER COLUMN public_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS rp_games_public_id_unique ON rp_games(public_id);

-- Paid entitlement is distinct from staff roles. Existing VIP roles remain in
-- rp_user_roles for historical visibility, but never grant cloud upload.
CREATE TABLE IF NOT EXISTS rp_subscriptions (
  user_id uuid PRIMARY KEY REFERENCES rp_users(id) ON DELETE CASCADE,
  vip_level smallint NOT NULL DEFAULT 0 CHECK (vip_level BETWEEN 0 AND 3),
  subscription_status text NOT NULL DEFAULT 'NONE' CHECK (subscription_status IN
    ('NONE','ACTIVE','CANCELED_BUT_ACTIVE','GRACE_PERIOD','DELETION_PENDING','DELETED','LEGACY_REVIEW')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  grace_started_at timestamptz,
  grace_expires_at timestamptz,
  cloud_deletion_status text NOT NULL DEFAULT 'NONE',
  cloud_deleted_at timestamptz,
  last_payment_confirmed_at timestamptz,
  payment_reference text UNIQUE,
  last_retention_audit_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (vip_level = 0 OR current_period_end IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS rp_subscriptions_grace_idx ON rp_subscriptions(grace_expires_at)
  WHERE subscription_status IN ('GRACE_PERIOD','DELETION_PENDING');

-- Preserve historical VIP users without inventing a payment or expiry date.
INSERT INTO rp_subscriptions(user_id, subscription_status)
  SELECT user_id, 'LEGACY_REVIEW' FROM rp_user_roles WHERE role = 'VIP'
  ON CONFLICT (user_id) DO NOTHING;
INSERT INTO rp_subscriptions(user_id, subscription_status)
  SELECT DISTINCT user_id, 'LEGACY_REVIEW' FROM rp_cloud_saves
  ON CONFLICT (user_id) DO NOTHING;

-- Existing 1..3 saves remain valid. Plans limit the account-wide total instead.
ALTER TABLE rp_cloud_saves DROP CONSTRAINT IF EXISTS rp_cloud_saves_slot_number_check;
ALTER TABLE rp_cloud_saves ADD CONSTRAINT rp_cloud_saves_slot_number_check CHECK (slot_number BETWEEN 1 AND 400);
ALTER TABLE rp_cloud_upload_sessions DROP CONSTRAINT IF EXISTS rp_cloud_upload_sessions_slot_number_check;
ALTER TABLE rp_cloud_upload_sessions ADD CONSTRAINT rp_cloud_upload_sessions_slot_number_check CHECK (slot_number BETWEEN 1 AND 400);
UPDATE rp_settings SET value = jsonb_set(value, '{maxSlotsPerGame}', '400'::jsonb)
  WHERE key = 'cloud_save';

CREATE TABLE IF NOT EXISTS rp_subscription_notices (
  user_id uuid NOT NULL REFERENCES rp_users(id) ON DELETE CASCADE,
  notice_type text NOT NULL,
  period_end timestamptz NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, notice_type, period_end)
);

CREATE TABLE IF NOT EXISTS rp_cloud_cleanup_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES rp_users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','RUNNING','PAUSED','DONE','ERROR')),
  scheduled_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error_code text,
  bytes_reclaimed bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
