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
