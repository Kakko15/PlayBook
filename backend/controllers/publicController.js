import supabase from "../supabaseClient.js";

export const getPublicTournaments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select(
        `
        id, name, game, start_date, end_date,
        teams(count)
      `
      )
      .eq("registration_open", true)
      .order("start_date", { ascending: false, nullsFirst: false });

    if (error) return next(error);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getPublicTournamentDetails = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();

    if (tournamentError) return next(tournamentError);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("*, players(*)")
      .eq("tournament_id", id)
      .order("wins", { ascending: false })
      .order("losses", { ascending: true });

    if (teamsError) return next(teamsError);

    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(
        "*, team1:teams!matches_team1_id_fkey(*), team2:teams!matches_team2_id_fkey(*)"
      )
      .eq("tournament_id", id)
      .order("match_date", { ascending: true, nullsFirst: true });

    if (matchesError) return next(matchesError);

    res.status(200).json({
      tournament,
      teams,
      matches,
    });
  } catch (error) {
    next(error);
  }
};
export const getLiveMatches = async (req, res, next) => {
  try {
    // Fetch matches that are not finalized but have teams assigned (active/upcoming)
    // Limit to 10 for the ticker
    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        id, round_name, team1_score, team2_score, status, is_finalized,
        team1:teams!matches_team1_id_fkey(name, department:departments(acronym)),
        team2:teams!matches_team2_id_fkey(name, department:departments(acronym)),
        tournament:tournaments(game)
      `
      )
      .not("team1_id", "is", null)
      .not("team2_id", "is", null)
      .eq("is_finalized", false)
      .order("match_date", { ascending: true, nullsLast: true })
      .limit(10);

    if (error) return next(error);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
export const getLeaderboard = async (req, res, next) => {
  try {
    // Get the most recent tournament (active or upcoming)
    const { data: tournament, error: tourneyError } = await supabase
      .from("tournaments")
      .select("id, name, game")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tourneyError) return next(tourneyError);
    if (!tournament) return res.status(200).json(null);

    // Get top 5 teams for this tournament
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("name, wins, losses, department:departments(acronym)")
      .eq("tournament_id", tournament.id)
      .order("wins", { ascending: false })
      .order("losses", { ascending: true })
      .limit(5);

    if (teamsError) return next(teamsError);

    res.status(200).json({ tournament, teams });
  } catch (error) {
    next(error);
  }
};

export const getNextMatch = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        id, match_date, round_name,
        team1:teams!matches_team1_id_fkey(name, department:departments(acronym)),
        team2:teams!matches_team2_id_fkey(name, department:departments(acronym)),
        tournament:tournaments(game)
      `
      )
      .eq("is_finalized", false)
      .not("match_date", "is", null)
      .gt("match_date", new Date().toISOString())
      .order("match_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getTopPlayer = async (req, res, next) => {
  try {
    // Get the most recent tournament
    const { data: tournament, error: tourneyError } = await supabase
      .from("tournaments")
      .select("id")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tourneyError) return next(tourneyError);
    if (!tournament) return res.status(200).json(null);

    const { data, error } = await supabase
      .from("players")
      .select(
        "name, isu_ps, team:teams!inner(name, department:departments(acronym))"
      )
      .eq("team.tournament_id", tournament.id)
      .order("isu_ps", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // If table doesn't exist, Supabase might return an error.
    // We'll handle it gracefully by returning empty array if error code indicates missing table.
    if (error) {
      if (error.code === "42P01") return res.status(200).json([]);
      return next(error);
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getRecentMatches = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        id, match_date, round_name, team1_score, team2_score,
        team1:teams!matches_team1_id_fkey(name, department:departments(acronym)),
        team2:teams!matches_team2_id_fkey(name, department:departments(acronym)),
        tournament:tournaments(game)
      `
      )
      .eq("is_finalized", true)
      .order("match_date", { ascending: false })
      .limit(3);

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getMatchPrediction = async (req, res, next) => {
  const { matchId } = req.params;
  try {
    // Fetch match details with team stats
    const { data: match, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        team1:teams!matches_team1_id_fkey(id, name, elo_rating, wins, losses),
        team2:teams!matches_team2_id_fkey(id, name, elo_rating, wins, losses)
      `
      )
      .eq("id", matchId)
      .single();

    if (error) return next(error);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const team1 = match.team1;
    const team2 = match.team2;

    // Simple Elo-based probability calculation
    // P(A) = 1 / (1 + 10 ^ ((RatingB - RatingA) / 400))
    const elo1 = team1?.elo_rating || 1200;
    const elo2 = team2?.elo_rating || 1200;

    const prob1 = 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));
    const prob2 = 1 - prob1;

    res.status(200).json({
      matchId,
      team1: {
        id: team1?.id,
        name: team1?.name,
        winProbability: Math.round(prob1 * 100),
      },
      team2: {
        id: team2?.id,
        name: team2?.name,
        winProbability: Math.round(prob2 * 100),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTeams = async (req, res, next) => {
  try {
    // Get teams from the most recent tournament
    const { data: tournament, error: tourneyError } = await supabase
      .from("tournaments")
      .select("id")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tourneyError) return next(tourneyError);
    if (!tournament) return res.status(200).json([]);

    const { data, error } = await supabase
      .from("teams")
      .select("id, name, logo_url, department:departments(acronym)")
      .eq("tournament_id", tournament.id);

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
