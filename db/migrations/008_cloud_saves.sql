-- RenPlay Cloud Save Premium Migration
-- Supports 3 cloud save slots per game for VIP/ADMIN users with atomic storage limits

CREATE TABLE IF NOT EXISTS rp_cloud_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES rp_users(id) ON DELETE CASCADE,
  game_id text NOT NULL REFERENCES rp_games(id) ON DELETE CASCADE,
  slot_number integer NOT NULL CHECK (slot_number BETWEEN 1 AND 3),
  original_filename text NOT NULL,
  object_key text NOT NULL UNIQUE,
  file_size bigint NOT NULL CHECK (file_size > 0),
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  game_version text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DELETED', 'ARCHIVED')),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rp_cloud_saves_user_game_slot UNIQUE (user_id, game_id, slot_number)
);

CREATE INDEX IF NOT EXISTS rp_cloud_saves_user_idx ON rp_cloud_saves(user_id, game_id);
CREATE INDEX IF NOT EXISTS rp_cloud_saves_updated_idx ON rp_cloud_saves(updated_at DESC);

CREATE TABLE IF NOT EXISTS rp_cloud_upload_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES rp_users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  slot_number integer NOT NULL CHECK (slot_number BETWEEN 1 AND 3),
  temporary_object_key text NOT NULL UNIQUE,
  expected_size bigint NOT NULL CHECK (expected_size > 0),
  expected_hash text NOT NULL CHECK (expected_hash ~ '^[a-f0-9]{64}$'),
  reserved_bytes bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'EXPIRED', 'FAILED')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rp_cloud_upload_user_status_idx ON rp_cloud_upload_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS rp_cloud_upload_expires_idx ON rp_cloud_upload_sessions(expires_at) WHERE status = 'PENDING';

CREATE TABLE IF NOT EXISTS rp_cloud_storage_usage (
  user_id uuid PRIMARY KEY REFERENCES rp_users(id) ON DELETE CASCADE,
  confirmed_bytes bigint NOT NULL DEFAULT 0 CHECK (confirmed_bytes >= 0),
  reserved_bytes bigint NOT NULL DEFAULT 0 CHECK (reserved_bytes >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO rp_settings (key, value) VALUES (
  'cloud_save',
  '{"enabled":true,"maxSlotsPerGame":3,"maxFileBytes":26214400,"maxUserBytes":100000000,"globalLimitBytes":8000000000,"warningBytes":7000000000,"classAMonthlyBudget":800000,"classBMonthlyBudget":8000000,"presignedUrlTtlSeconds":120}'
) ON CONFLICT (key) DO NOTHING;
