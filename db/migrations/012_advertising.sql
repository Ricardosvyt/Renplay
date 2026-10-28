CREATE TABLE IF NOT EXISTS rp_ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  advertiser_name text NOT NULL,
  status text NOT NULL DEFAULT 'PAUSED' CHECK (status IN ('ACTIVE','PAUSED','SCHEDULED','ENDED')),
  starts_at timestamptz,
  ends_at timestamptz,
  priority integer NOT NULL DEFAULT 0 CHECK (priority BETWEEN 0 AND 1000),
  impression_limit bigint CHECK (impression_limit IS NULL OR impression_limit > 0),
  click_limit bigint CHECK (click_limit IS NULL OR click_limit > 0),
  targeting jsonb NOT NULL DEFAULT '{}',
  frequency_cap integer CHECK (frequency_cap IS NULL OR frequency_cap BETWEEN 1 AND 100),
  created_by uuid REFERENCES rp_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rp_ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES rp_ad_campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  image_object_key text,
  destination_url text NOT NULL,
  creative_type text NOT NULL CHECK (creative_type IN ('BANNER','SPONSORED_CARD','SPONSORED_GAME','INTERNAL_PROMO','EXTERNAL_PARTNER')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (image_url IS NOT NULL OR image_object_key IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS rp_ad_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('LAUNCHER','SITE','BOTH')),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rp_ad_campaign_placements (
  campaign_id uuid NOT NULL REFERENCES rp_ad_campaigns(id) ON DELETE CASCADE,
  placement_id uuid NOT NULL REFERENCES rp_ad_placements(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, placement_id)
);

CREATE TABLE IF NOT EXISTS rp_ad_events (
  id bigserial PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES rp_ad_campaigns(id) ON DELETE CASCADE,
  creative_id uuid NOT NULL REFERENCES rp_ad_creatives(id) ON DELETE CASCADE,
  placement_id uuid NOT NULL REFERENCES rp_ad_placements(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('IMPRESSION','CLICK')),
  event_time timestamptz NOT NULL DEFAULT now(),
  anonymous_session_id text NOT NULL,
  dedupe_key text NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS rp_ad_campaigns_delivery ON rp_ad_campaigns(status, starts_at, ends_at, priority DESC);
CREATE INDEX IF NOT EXISTS rp_ad_events_campaign_time ON rp_ad_events(campaign_id, event_time DESC);
CREATE INDEX IF NOT EXISTS rp_ad_events_placement_time ON rp_ad_events(placement_id, event_time DESC);
CREATE INDEX IF NOT EXISTS rp_ad_events_session_time ON rp_ad_events(anonymous_session_id, event_time DESC);

INSERT INTO rp_ad_placements(code,name,platform) VALUES
  ('home_banner','Banner da página inicial','LAUNCHER'),
  ('library_card','Card patrocinado da biblioteca','LAUNCHER'),
  ('game_details_banner','Banner nos detalhes do jogo','LAUNCHER'),
  ('recommendations','Jogo patrocinado nas recomendações','LAUNCHER'),
  ('promo_banner','Banner promocional RenPlay','BOTH'),
  ('site_catalog','Card patrocinado do catálogo do site','SITE')
ON CONFLICT (code) DO NOTHING;

INSERT INTO rp_settings(key,value) VALUES ('advertising', '{
  "enabled": true,
  "siteEnabled": true,
  "launcherEnabled": true,
  "internalCampaignsEnabled": true,
  "refreshSeconds": 300,
  "maxPerPlacement": 2,
  "vipBehavior": "internal_only"
}'::jsonb) ON CONFLICT (key) DO NOTHING;
