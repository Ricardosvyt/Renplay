-- Garantir unicidade case-insensitive para nomes de usuário no banco de dados Neon
CREATE UNIQUE INDEX IF NOT EXISTS rp_users_username_lower_idx ON rp_users (lower(username));
