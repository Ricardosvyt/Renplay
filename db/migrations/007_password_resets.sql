CREATE TABLE IF NOT EXISTS rp_password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES rp_users(id) ON DELETE CASCADE,
  code_hmac text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  attempts_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  consumed_at timestamptz,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'CONSUMED', 'EXPIRED', 'REVOKED')),
  reset_token_hash text UNIQUE,
  reset_token_expires_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_rp_password_resets_user_status ON rp_password_resets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_rp_password_resets_reset_token ON rp_password_resets(reset_token_hash) WHERE reset_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rp_password_resets_created_at ON rp_password_resets(created_at DESC);
