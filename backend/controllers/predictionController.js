import supabase from "../supabaseClient.js";

export const makePick = async (req, res, next) => {
  const userId = req.user?.userId;
  const { match_id, predicted_winner_team_id, guest_id, guest_name } = req.body;

  if (!match_id || !predicted_winner_team_id) {
    return res
      .status(400)
      .json({ message: "Match ID and predicted winner ID are required." });
  }

  if (!userId && (!guest_id || !guest_name)) {
    return res
      .status(401)
      .json({ message: "You must be logged in or provide guest details." });
  }

  try {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("status")
      .eq("id", match_id)
      .single();

    if (matchError) return next(matchError);
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }
    if (match.status !== "pending") {
      return res.status(403).json({
        message: "Predictions are locked. This match has started or finished.",
      });
    }

    const payload = {
      match_id,
      predicted_winner_team_id,
      status: "pending",
    };

    let conflictTarget = "";

    if (userId) {
      payload.user_id = userId;
      conflictTarget = "user_id, match_id";
    } else {
      payload.guest_id = guest_id;
      payload.guest_name = guest_name;
      conflictTarget = "guest_id, match_id";
    }

    const { data, error } = await supabase
      .from("predictions")
      .upsert(payload, {
        onConflict: conflictTarget,
      })
      .select();

    if (error) return next(error);
    res
      .status(200)
      .json({ message: "Pick saved successfully.", pick: data[0] });
  } catch (error) {
    next(error);
  }
};

export const getMyPicks = async (req, res, next) => {
  const userId = req.user?.userId;
  const { guest_id } = req.query;
  const { tournamentId } = req.params;

  if (!userId && !guest_id) {
    // If no ID provided, just return empty list instead of error,
    // so frontend doesn't break for new guests
    return res.status(200).json([]);
  }

  try {
    let query = supabase.from("predictions").select(
      `
        match_id,
        predicted_winner_team_id,
        status,
        match:matches!inner(tournament_id)
      `
    );

    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      query = query.eq("guest_id", guest_id);
    }

    const { data, error } = await query.eq("match.tournament_id", tournamentId);

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  const { tournamentId } = req.params;

  try {
    const { data, error } = await supabase.rpc("get_pickems_leaderboard", {
      p_tournament_id: tournamentId,
    });

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
