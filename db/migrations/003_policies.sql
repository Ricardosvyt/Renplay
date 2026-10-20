UPDATE rp_settings SET value=value||'{"terms":"","privacy":"","policyVersion":1}'::jsonb WHERE key='platform';
