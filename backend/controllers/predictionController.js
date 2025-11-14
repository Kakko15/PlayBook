import supabase from "../supabaseClient.js";

export const makePick = async (req, res) => {
  const { userId } = req.user;
  const { match_id, predicted_winner_team_id } = req.body;

  if (!match_id || !predicted_winner_team_id) {
    return res
      .status(400)
      .json({ message: "Match ID and predicted winner ID are required." });
  }

  try {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("status")
      .eq("id", match_id)
      .single();

    if (matchError) throw matchError;
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }
    if (match.status !== "pending") {
      return res
        .status(403)
        .json({
          message:
            "Predictions are locked. This match has started or finished.",
        });
    }

    const { data, error } = await supabase
      .from("predictions")
      .upsert(
        {
          user_id: userId,
          match_id,
          predicted_winner_team_id,
          status: "pending",
        },
        {
          onConflict: "user_id, match_id",
        }
      )
      .select();

    if (error) throw error;
    res
      .status(200)
      .json({ message: "Pick saved successfully.", pick: data[0] });
  } catch (error) {
    console.error("Make Pick Error:", error.message);
    res.status(500).json({ message: "Error saving pick." });
  }
};

export const getMyPicks = async (req, res) => {
  const { userId } = req.user;
  const { tournamentId } = req.params;

  try {
    const { data, error } = await supabase
      .from("predictions")
      .select(
        `
        match_id,
        predicted_winner_team_id,
        status,
        match:matches!inner(tournament_id)
      `
      )
      .eq("user_id", userId)
      .eq("match.tournament_id", tournamentId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Get My Picks Error:", error.message);
    res.status(500).json({ message: "Error fetching user predictions." });
  }
};

export const getLeaderboard = async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const { data, error } = await supabase.rpc("get_pickems_leaderboard", {
      p_tournament_id: tournamentId,
    });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Leaderboard Error:", error.message);
    res.status(500).json({ message: "Error fetching leaderboard." });
  }
};
