ALTER TABLE rp_assets ADD COLUMN manifest jsonb NOT NULL DEFAULT '[]';
ALTER TABLE rp_assets ADD COLUMN signature jsonb;
