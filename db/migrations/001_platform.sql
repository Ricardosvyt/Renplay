CREATE TABLE rp_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), username text NOT NULL UNIQUE, email text NOT NULL UNIQUE,
 display_name text NOT NULL, password_hash text NOT NULL, active boolean NOT NULL DEFAULT true,
 email_verified boolean NOT NULL DEFAULT false, must_change_password boolean NOT NULL DEFAULT false,
 terms_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), last_login_at timestamptz,
 CHECK (username = lower(username)), CHECK (email = lower(email))
);
CREATE TABLE rp_user_roles (user_id uuid REFERENCES rp_users ON DELETE CASCADE, role text NOT NULL CHECK(role IN ('USER','ADMIN','DEVELOPER','TRANSLATOR','MODERATOR','VIP','TRANSLATION_MODERATOR')), PRIMARY KEY(user_id,role));
DO $$
BEGIN
  IF to_regclass('public.staff_users') IS NOT NULL THEN
    INSERT INTO rp_users(id,username,email,display_name,password_hash,active,must_change_password)
      SELECT id,lower(username),lower(email),display_name,password_hash,is_active,must_change_password
      FROM staff_users;
    INSERT INTO rp_user_roles SELECT id,upper(role) FROM staff_users;
    INSERT INTO rp_user_roles SELECT id,'USER' FROM staff_users ON CONFLICT DO NOTHING;
  END IF;
END $$;
CREATE TABLE rp_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES rp_users ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE, refresh_hash text UNIQUE, family_id uuid NOT NULL DEFAULT gen_random_uuid(),
 kind text NOT NULL CHECK(kind IN ('web','desktop')), device text NOT NULL DEFAULT '',
 expires_at timestamptz NOT NULL, refresh_expires_at timestamptz, revoked_at timestamptz,
 mfa_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rp_sessions_user ON rp_sessions(user_id);
CREATE TABLE rp_tokens (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES rp_users ON DELETE CASCADE, token_hash text NOT NULL UNIQUE, purpose text NOT NULL, data jsonb NOT NULL DEFAULT '{}', expires_at timestamptz NOT NULL, used_at timestamptz);
CREATE TABLE rp_mfa (user_id uuid PRIMARY KEY REFERENCES rp_users ON DELETE CASCADE, secret text NOT NULL, enabled boolean NOT NULL DEFAULT false, last_counter bigint NOT NULL DEFAULT -1);
CREATE TABLE rp_recovery_codes (user_id uuid REFERENCES rp_users ON DELETE CASCADE, hash text PRIMARY KEY, used_at timestamptz);
CREATE TABLE rp_limits (key text PRIMARY KEY, hits integer NOT NULL, resets_at timestamptz NOT NULL);
CREATE TABLE rp_settings (key text PRIMARY KEY, value jsonb NOT NULL);
INSERT INTO rp_settings VALUES ('platform','{"publicRegistration":true,"name":"RenPlay","maintenance":false,"announcement":"","minimumLauncherVersion":"0.1.0","configVersion":1}');
CREATE TABLE rp_games (
 id text PRIMARY KEY, name text NOT NULL, status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','REJECTED','APPROVED','PUBLISHED','SUSPENDED','ARCHIVED')),
 metadata jsonb NOT NULL DEFAULT '{}', distribution_authorized boolean NOT NULL DEFAULT false, created_by uuid REFERENCES rp_users,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rp_games_status ON rp_games(status);
CREATE TABLE rp_assignments (game_id text REFERENCES rp_games ON DELETE CASCADE, user_id uuid REFERENCES rp_users ON DELETE CASCADE, scope text NOT NULL CHECK(scope IN ('developer','translator')), PRIMARY KEY(game_id,user_id,scope));
CREATE TABLE rp_assets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES rp_users, game_id text REFERENCES rp_games,
 kind text NOT NULL CHECK(kind IN ('build','translation','image','launcher')), object_key text NOT NULL UNIQUE, filename text NOT NULL,
 size_bytes bigint NOT NULL CHECK(size_bytes>0), sha256 text NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'), content_type text NOT NULL,
 status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','UPLOADED','VERIFIED','REJECTED')), error text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rp_builds (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), game_id text NOT NULL REFERENCES rp_games, asset_id uuid NOT NULL REFERENCES rp_assets,
 version text NOT NULL, platform text NOT NULL DEFAULT 'win32', architecture text NOT NULL DEFAULT 'x64', channel text NOT NULL DEFAULT 'stable',
 executable text NOT NULL, files jsonb NOT NULL, notes text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'DRAFT', created_by uuid REFERENCES rp_users,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(game_id,version,platform,architecture,channel)
);
CREATE TABLE rp_translations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), game_id text NOT NULL REFERENCES rp_games, asset_id uuid NOT NULL REFERENCES rp_assets,
 language text NOT NULL, version text NOT NULL, compatible_versions jsonb NOT NULL, files jsonb NOT NULL,
 notes text NOT NULL DEFAULT '', credits text NOT NULL DEFAULT '', distribution_authorized boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'DRAFT', created_by uuid NOT NULL REFERENCES rp_users, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(game_id,language,version)
);
CREATE TABLE rp_library (user_id uuid REFERENCES rp_users ON DELETE CASCADE, game_id text REFERENCES rp_games, favorite boolean NOT NULL DEFAULT false, added_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,game_id));
CREATE TABLE rp_reviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES rp_users, game_id text REFERENCES rp_games, rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5), text text NOT NULL, hidden boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,game_id));
CREATE TABLE rp_reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES rp_users, game_id text REFERENCES rp_games, kind text NOT NULL CHECK(kind IN ('bug','broken-link','game')), details text NOT NULL, status text NOT NULL DEFAULT 'OPEN', resolution text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE rp_notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES rp_users ON DELETE CASCADE, title text NOT NULL, body text NOT NULL, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX rp_notifications_user ON rp_notifications(user_id,created_at DESC);
CREATE TABLE rp_downloads (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES rp_users, game_id text REFERENCES rp_games, build_id uuid REFERENCES rp_builds, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE rp_launcher_releases (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version text NOT NULL, channel text NOT NULL CHECK(channel IN ('stable','beta')), platform text NOT NULL DEFAULT 'win32', architecture text NOT NULL DEFAULT 'x64', asset_id uuid NOT NULL REFERENCES rp_assets, notes text NOT NULL, minimum_version text NOT NULL, mandatory boolean NOT NULL DEFAULT false, status text NOT NULL DEFAULT 'DRAFT', publisher_name text NOT NULL, created_by uuid REFERENCES rp_users, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(version,channel,platform,architecture));
CREATE TABLE rp_audit (id bigserial PRIMARY KEY, actor_id uuid REFERENCES rp_users, action text NOT NULL, resource text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX rp_audit_created ON rp_audit(created_at DESC);
CREATE TABLE rp_jobs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL, payload jsonb NOT NULL, status text NOT NULL DEFAULT 'PENDING', attempts integer NOT NULL DEFAULT 0, available_at timestamptz NOT NULL DEFAULT now(), error text, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX rp_jobs_pending ON rp_jobs(status,available_at);
