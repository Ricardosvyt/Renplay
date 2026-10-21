CREATE TABLE IF NOT EXISTS rp_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL,
  resets_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS rp_sessions_expiry_idx
  ON rp_sessions (expires_at)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS rp_limits_reset_idx
  ON rp_limits (resets_at);
