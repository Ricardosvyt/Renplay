CREATE OR REPLACE FUNCTION rp_prevent_public_game_id_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.public_id IS DISTINCT FROM OLD.public_id THEN
    RAISE EXCEPTION 'Public game IDs are permanent.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rp_games_stable_public_id ON rp_games;
CREATE TRIGGER rp_games_stable_public_id
BEFORE UPDATE OF public_id ON rp_games
FOR EACH ROW EXECUTE FUNCTION rp_prevent_public_game_id_change();
