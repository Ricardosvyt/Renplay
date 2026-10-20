CREATE TABLE IF NOT EXISTS staff_users (
  id uuid PRIMARY KEY,
  username text NOT NULL,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'moderator', 'developer', 'translator')),
  password_hash text NOT NULL,
  must_change_password boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS username text;
UPDATE staff_users SET username = left(lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_.-]', '_', 'g')), 24) || '_' || left(id::text, 6) WHERE username IS NULL;
ALTER TABLE staff_users ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS staff_users_username_idx ON staff_users (username);
ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS staff_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS staff_sessions_expiry_idx ON staff_sessions (expires_at);
CREATE INDEX IF NOT EXISTS staff_sessions_user_idx ON staff_sessions (user_id);

CREATE TABLE IF NOT EXISTS staff_login_attempts (
  email text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz
);
