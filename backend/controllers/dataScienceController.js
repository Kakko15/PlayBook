import supabase from "../supabaseClient.js";

export const getGlobalAnalytics = async (req, res) => {
  try {
    const { data: archetypes, error: archetypeError } = await supabase
      .from("players")
      .select("game, archetype, count:id")
      .neq("archetype", null)
      .groupBy("game, archetype");

    if (archetypeError) throw archetypeError;

    const { data: model, error: modelError } = await supabase
      .from("model_coefficients")
      .select("model_name, coefficients, updated_at")
      .eq("model_name", "win_predictor")
      .maybeSingle();

    if (modelError) throw modelError;

    res.status(200).json({ archetypes, winPredictor: model });
  } catch (error) {
    console.error("Get Global Analytics Error:", error.message);
    res.status(500).json({ message: "Error fetching global analytics." });
  }
};

export const trainArchetypeModel = async (req, res) => {
  const { game } = req.body;
  if (!game) {
    return res.status(400).json({ message: "Game type is required." });
  }

  try {
    const { error: vectorError } = await supabase.rpc(
      "calculate_player_stats_vector",
      { p_game_type: game }
    );
    if (vectorError) throw vectorError;

    const { error: archetypeError } = await supabase.rpc(
      "assign_player_archetypes",
      { p_game_type: game }
    );
    if (archetypeError) throw archetypeError;

    res
      .status(200)
      .json({ message: `Player archetype model "trained" for ${game}.` });
  } catch (error) {
    console.error("Train Archetype Model Error:", error.message);
    res.status(500).json({ message: "Error training archetype model." });
  }
};

export const trainWinPredictor = async (req, res) => {
  const { coefficients } = req.body;
  if (!coefficients) {
    return res.status(400).json({ message: "Coefficients are required." });
  }

  try {
    const { error } = await supabase
      .from("model_coefficients")
      .upsert(
        { model_name: "win_predictor", coefficients, updated_at: new Date() },
        { onConflict: "model_name" }
      );

    if (error) throw error;

    res.status(200).json({ message: "Win predictor model updated." });
  } catch (error) {
    console.error("Train Win Predictor Error:", error.message);
    res.status(500).json({ message: "Error saving win predictor model." });
  }
};

export const getSimilarPlayers = async (req, res) => {
  const { playerId } = req.params;
  const { game, limit = 5 } = req.query;

  if (!game) {
    return res.status(400).json({ message: "Game type is required." });
  }

  try {
    const { data, error } = await supabase.rpc("find_similar_players", {
      p_player_id: playerId,
      p_game_type: game,
      p_limit: parseInt(limit, 10),
    });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Similar Players Error:", error.message);
    res.status(500).json({ message: "Error finding similar players." });
  }
};

export const getMatchPrediction = async (req, res) => {
  const { matchId } = req.params;
  try {
    const { data: modelData, error: modelError } = await supabase
      .from("model_coefficients")
      .select("coefficients")
      .eq("model_name", "win_predictor")
      .single();

    if (modelError || !modelData) {
      return res
        .status(404)
        .json({ message: "Win predictor model not found." });
    }

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select(
        "team1:teams!matches_team1_id_fkey(*), team2:teams!matches_team2_id_fkey(*)"
      )
      .eq("id", matchId)
      .single();

    if (matchError || !match || !match.team1 || !match.team2) {
      return res.status(404).json({ message: "Match or teams not found." });
    }

    const { coefficients } = modelData;
    const { intercept, elo_diff, win_streak_diff } = coefficients;

    const team1 = match.team1;
    const team2 = match.team2;

    const eloDiff = (team1.elo_rating || 1200) - (team2.elo_rating || 1200);
    const winStreakDiff = (team1.win_streak || 0) - (team2.win_streak || 0);

    const z = intercept + elo_diff * eloDiff + win_streak_diff * winStreakDiff;
    const winProbability = 1 / (1 + Math.exp(-z));

    res.status(200).json({
      team1_win_probability: winProbability,
      team2_win_probability: 1 - winProbability,
    });
  } catch (error) {
    console.error("Get Match Prediction Error:", error.message);
    res.status(500).json({ message: "Error predicting match outcome." });
  }
};
