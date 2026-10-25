-- Keep the site-assigned game ID stable across installs and Premium saves.
-- Existing IDs and save rows remain unchanged.

CREATE OR REPLACE FUNCTION rp_prevent_game_id_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Game IDs are permanent; archive the game instead of renaming its ID.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rp_games_stable_id ON rp_games;
CREATE TRIGGER rp_games_stable_id
BEFORE UPDATE OF id ON rp_games
FOR EACH ROW EXECUTE FUNCTION rp_prevent_game_id_change();

-- A game cannot be hard-deleted while it owns Premium saves.
ALTER TABLE rp_cloud_saves
  DROP CONSTRAINT IF EXISTS rp_cloud_saves_game_id_fkey;
ALTER TABLE rp_cloud_saves
  ADD CONSTRAINT rp_cloud_saves_game_id_fkey
  FOREIGN KEY (game_id) REFERENCES rp_games(id) ON DELETE RESTRICT;

-- Upload sessions also refer to an existing site game. NOT VALID preserves
-- any old pending rows; PostgreSQL still enforces the FK for new sessions.
ALTER TABLE rp_cloud_upload_sessions
  ADD CONSTRAINT rp_cloud_upload_sessions_game_id_fkey
  FOREIGN KEY (game_id) REFERENCES rp_games(id) ON DELETE RESTRICT NOT VALID;
