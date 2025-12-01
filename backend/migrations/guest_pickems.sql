-- Migration to enable Guest Pickems

-- 1. Make user_id nullable in predictions table
ALTER TABLE predictions ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add guest_id and guest_name columns
ALTER TABLE predictions ADD COLUMN guest_id uuid;
ALTER TABLE predictions ADD COLUMN guest_name text;

-- 3. Update unique constraint to allow guests
-- Note: Supabase/Postgres unique constraints with NULLs are tricky.
-- We need to drop the existing constraint and create a partial index or a more complex constraint.
-- Assuming the existing constraint is named "predictions_user_id_match_id_key" or similar.
-- You might need to find the exact name using: SELECT * FROM pg_indexes WHERE tablename = 'predictions';

-- DROP CONSTRAINT IF EXISTS predictions_user_id_match_id_key; -- This might fail if it's an index, not a constraint.
-- ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_user_id_match_id_key;

-- Create unique index for registered users
CREATE UNIQUE INDEX IF NOT EXISTS idx_predictions_user_match ON predictions (user_id, match_id) WHERE user_id IS NOT NULL;

-- Create unique index for guests
CREATE UNIQUE INDEX IF NOT EXISTS idx_predictions_guest_match ON predictions (guest_id, match_id) WHERE guest_id IS NOT NULL;

-- 4. Update the leaderboard function (RPC)
-- We need to drop the function first because we are changing its return type
DROP FUNCTION IF EXISTS get_pickems_leaderboard(uuid);

CREATE OR REPLACE FUNCTION get_pickems_leaderboard(p_tournament_id uuid)
RETURNS TABLE (
  user_id uuid,
  guest_id uuid,
  name text,
  correct_picks bigint,
  total_points bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.guest_id,
    COALESCE(u.name, p.guest_name, 'Anonymous') as name,
    COUNT(*) FILTER (WHERE p.status = 'correct') as correct_picks,
    SUM(CASE WHEN p.status = 'correct' THEN 1 ELSE 0 END) * 10 as total_points -- Assuming 10 points per win
  FROM predictions p
  LEFT JOIN auth.users u ON p.user_id = u.id -- Adjust if using a public.users table
  JOIN matches m ON p.match_id = m.id
  WHERE m.tournament_id = p_tournament_id
  GROUP BY p.user_id, p.guest_id, u.name, p.guest_name
  ORDER BY total_points DESC;
END;
$$ LANGUAGE plpgsql;
