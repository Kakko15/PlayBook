import supabase from "../supabaseClient.js";
import { generateRoundRobin, calculateElo } from "../utils/tournamentLogic.js";

export const createTournament = async (req, res) => {
  const { name, game } = req.body;
  const ownerId = req.user.userId;

  if (!name || !game) {
    return res.status(400).json({ message: "Name and game are required." });
  }

  try {
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .insert({
        name,
        game,
        owner_id: ownerId,
      })
      .select()
      .single();

    if (tournamentError) throw tournamentError;

    const { error: collaboratorError } = await supabase
      .from("collaborators")
      .insert({
        tournament_id: tournament.id,
        user_id: ownerId,
      });

    if (collaboratorError) throw collaboratorError;

    res.status(201).json(tournament);
  } catch (error) {
    console.error("Create Tournament Error:", error.message);
    res.status(500).json({ message: "Error creating tournament." });
  }
};

export const getMyTournaments = async (req, res) => {
  const userId = req.user.userId;
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select(
        `
        id, name, game, start_date, end_date,
        teams(count),
        collaborators!inner(user_id)
      `
      )
      .eq("collaborators.user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("Get My Tournaments Error:", error.message);
    res.status(500).json({ message: "Error fetching tournaments." });
  }
};

export const getTournamentById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select(
        `
        *,
        collaborators!inner(user_id)
      `
      )
      .eq("id", id)
      .eq("collaborators.user_id", userId)
      .single();

    if (error) throw error;
    if (!data) {
      return res
        .status(404)
        .json({ message: "Tournament not found or access denied." });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Get Tournament By Id Error:", error.message);
    res.status(500).json({ message: "Error fetching tournament details." });
  }
};

export const updateTournament = async (req, res) => {
  const { id } = req.params;
  const { name, game, startDate, endDate, registrationOpen } = req.body;

  const updates = {
    name,
    game,
    start_date: startDate,
    end_date: endDate,
    registration_open: registrationOpen,
  };

  Object.keys(updates).forEach(
    (key) => updates[key] === undefined && delete updates[key]
  );

  try {
    const { data, error } = await supabase
      .from("tournaments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Update Tournament Error:", error.message);
    res.status(500).json({ message: "Error updating tournament." });
  }
};

export const deleteTournament = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Tournament deleted successfully." });
  } catch (error) {
    console.error("Delete Tournament Error:", error.message);
    res.status(500).json({ message: "Error deleting tournament." });
  }
};

export const getTeams = async (req, res) => {
  const { tournamentId } = req.params;
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("*, players(count)")
      .eq("tournament_id", tournamentId)
      .order("name", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Teams Error:", error.message);
    res.status(500).json({ message: "Error fetching teams." });
  }
};

export const addTeam = async (req, res) => {
  const { tournamentId } = req.params;
  const { name, logo_url } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Team name is required." });
  }

  try {
    const { data, error } = await supabase
      .from("teams")
      .insert({
        name,
        logo_url: logo_url || null,
        tournament_id: tournamentId,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Add Team Error:", error.message);
    res.status(500).json({ message: "Error adding team." });
  }
};

export const updateTeam = async (req, res) => {
  const { teamId } = req.params;
  const { name, logo_url } = req.body;

  try {
    const { data, error } = await supabase
      .from("teams")
      .update({
        name,
        logo_url: logo_url || null,
      })
      .eq("id", teamId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Update Team Error:", error.message);
    res.status(500).json({ message: "Error updating team." });
  }
};

export const deleteTeam = async (req, res) => {
  const { teamId } = req.params;
  try {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) throw error;
    res.status(200).json({ message: "Team deleted successfully." });
  } catch (error) {
    console.error("Delete Team Error:", error.message);
    res.status(500).json({ message: "Error deleting team." });
  }
};

export const getPlayers = async (req, res) => {
  const { teamId } = req.params;
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .order("name", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Players Error:", error.message);
    res.status(500).json({ message: "Error fetching players." });
  }
};

export const addPlayer = async (req, res) => {
  const { teamId } = req.params;
  const { name, game_specific_data } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Player name is required." });
  }

  try {
    const { data, error } = await supabase
      .from("players")
      .insert({
        name,
        team_id: teamId,
        game_specific_data: game_specific_data || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Add Player Error:", error.message);
    res.status(500).json({ message: "Error adding player." });
  }
};

export const updatePlayer = async (req, res) => {
  const { playerId } = req.params;
  const { name, game_specific_data } = req.body;

  try {
    const { data, error } = await supabase
      .from("players")
      .update({
        name,
        game_specific_data: game_specific_data || null,
      })
      .eq("id", playerId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Update Player Error:", error.message);
    res.status(500).json({ message: "Error updating player." });
  }
};

export const deletePlayer = async (req, res) => {
  const { playerId } = req.params;
  try {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId);
    if (error) throw error;
    res.status(200).json({ message: "Player deleted successfully." });
  } catch (error) {
    console.error("Delete Player Error:", error.message);
    res.status(500).json({ message: "Error deleting player." });
  }
};

export const generateSchedule = async (req, res) => {
  const { id: tournament_id } = req.params;

  try {
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id")
      .eq("tournament_id", tournament_id);

    if (teamsError) throw teamsError;
    if (teams.length < 2) {
      return res.status(400).json({
        message: "At least two teams are required to generate a schedule.",
      });
    }

    await supabase.from("matches").delete().eq("tournament_id", tournament_id);

    const matches = generateRoundRobin(teams.map((t) => t.id));

    const matchesToInsert = matches.map((match) => ({
      tournament_id,
      team1_id: match.team1_id,
      team2_id: match.team2_id,
      status: "pending",
    }));

    const { error: insertError } = await supabase
      .from("matches")
      .insert(matchesToInsert);

    if (insertError) throw insertError;

    res.status(201).json({ message: "Schedule generated successfully." });
  } catch (error) {
    console.error("Generate Schedule Error:", error.message);
    res.status(500).json({ message: "Error generating schedule." });
  }
};

export const generatePlayoffBracket = async (req, res) => {
  const { id: tournament_id } = req.params;
  const { numTeams } = req.body;

  if (![4, 8, 16].includes(numTeams)) {
    return res
      .status(400)
      .json({ message: "Number of teams must be 4, 8, or 16." });
  }

  try {
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id")
      .eq("tournament_id", tournament_id)
      .order("wins", { ascending: false })
      .order("elo_rating", { ascending: false })
      .limit(numTeams);

    if (teamsError) throw teamsError;
    if (teams.length < numTeams) {
      return res
        .status(400)
        .json({ message: `Not enough teams for a ${numTeams}-team bracket.` });
    }

    const [seed1, seed8, seed4, seed5, seed3, seed6, seed2, seed7] = teams.map(
      (t) => t.id
    );
    const pairings = [
      [seed1, seed8],
      [seed4, seed5],
      [seed3, seed6],
      [seed2, seed7],
    ];

    const { data: finalMatch, error: finalError } = await supabase
      .from("matches")
      .insert({
        tournament_id,
        round_name: "Finals",
        status: "pending",
      })
      .select("id")
      .single();
    if (finalError) throw finalError;

    const { data: semiFinal1, error: sf1Error } = await supabase
      .from("matches")
      .insert({
        tournament_id,
        round_name: "Semifinals",
        status: "pending",
        next_match_id: finalMatch.id,
        winner_advances_to_slot: "team1",
      })
      .select("id")
      .single();
    if (sf1Error) throw sf1Error;

    const { data: semiFinal2, error: sf2Error } = await supabase
      .from("matches")
      .insert({
        tournament_id,
        round_name: "Semifinals",
        status: "pending",
        next_match_id: finalMatch.id,
        winner_advances_to_slot: "team2",
      })
      .select("id")
      .single();
    if (sf2Error) throw sf2Error;

    const quarterFinals = [
      {
        pairing: pairings[0],
        next: semiFinal1.id,
        slot: "team1",
      },
      {
        pairing: pairings[1],
        next: semiFinal1.id,
        slot: "team2",
      },
      {
        pairing: pairings[2],
        next: semiFinal2.id,
        slot: "team1",
      },
      {
        pairing: pairings[3],
        next: semiFinal2.id,
        slot: "team2",
      },
    ];

    const qfMatches = quarterFinals.map((qf, index) => ({
      tournament_id,
      team1_id: qf.pairing[0],
      team2_id: qf.pairing[1],
      round_name: `Quarterfinals ${index + 1}`,
      status: "pending",
      next_match_id: qf.next,
      winner_advances_to_slot: qf.slot,
    }));

    const { error: qfError } = await supabase.from("matches").insert(qfMatches);
    if (qfError) throw qfError;

    res.status(201).json({ message: "8-team bracket generated successfully." });
  } catch (error) {
    console.error("Generate Bracket Error:", error.message);
    res.status(500).json({ message: "Error generating bracket." });
  }
};

export const getSchedule = async (req, res) => {
  const { id: tournament_id } = req.params;
  try {
    const { data, error } = await supabase
      .from("matches")
      .select(
        "*, team1:teams!matches_team1_id_fkey(*), team2:teams!matches_team2_id_fkey(*)"
      )
      .eq("tournament_id", tournament_id)
      .order("round_name", { ascending: true, nullsFirst: true })
      .order("match_date", { ascending: true, nullsFirst: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Schedule Error:", error.message);
    res.status(500).json({ message: "Error fetching schedule." });
  }
};

export const getStandings = async (req, res) => {
  const { id: tournament_id } = req.params;
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("tournament_id", tournament_id)
      .order("wins", { ascending: false })
      .order("losses", { ascending: true })
      .order("elo_rating", { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Standings Error:", error.message);
    res.status(500).json({ message: "Error fetching standings." });
  }
};

export const getMatchDetails = async (req, res) => {
  const { id: match_id } = req.params;
  try {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select(
        "*, team1:teams!matches_team1_id_fkey(*, players(*)), team2:teams!matches_team2_id_fkey(*, players(*))"
      )
      .eq("id", match_id)
      .single();

    if (matchError) throw matchError;
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    res.status(200).json(match);
  } catch (error) {
    console.error("Get Match Details Error:", error.message);
    res.status(500).json({ message: "Error fetching match details." });
  }
};

export const logMatchResult = async (req, res) => {
  const { id: match_id } = req.params;
  const { team1_score, team2_score, player_stats, match_date, round_name } =
    req.body;

  if (team1_score == null || team2_score == null) {
    return res.status(400).json({ message: "Team scores are required." });
  }

  try {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select(
        "*, team1:teams!matches_team1_id_fkey(*), team2:teams!matches_team2_id_fkey(*)"
      )
      .eq("id", match_id)
      .single();

    if (matchError) throw matchError;
    if (!match) return res.status(404).json({ message: "Match not found." });

    const wasCompleted = match.status === "completed";
    const oldWinnerId =
      match.team1_score > match.team2_score ? match.team1_id : match.team2_id;
    const oldLoserId =
      match.team1_score < match.team2_score ? match.team1_id : match.team2_id;

    const team1 = match.team1;
    const team2 = match.team2;

    const [newEloTeam1, newEloTeam2] = calculateElo(
      team1.elo_rating,
      team2.elo_rating,
      team1_score > team2_score ? 1 : 0
    );

    const matchWinnerId = team1_score > team2_score ? team1.id : team2.id;
    const matchLoserId = team1_score < team2_score ? team1.id : team2.id;

    await supabase.rpc("update_match_results", {
      p_match_id: match_id,
      p_team1_id: team1.id,
      p_team2_id: team2.id,
      p_team1_score: team1_score,
      p_team2_score: team2_score,
      p_team1_new_elo: newEloTeam1,
      p_team2_new_elo: newEloTeam2,
      p_match_winner_id: matchWinnerId,
      p_match_loser_id: matchLoserId,
      p_was_completed: wasCompleted,
      p_old_winner_id: oldWinnerId,
      p_old_loser_id: oldLoserId,
      p_match_date: match_date || match.match_date,
      p_round_name: round_name || match.round_name,
    });

    // --- NEW LOGIC FOR WIN STREAKS ---
    await supabase
      .from("teams")
      .increment("win_streak", 1)
      .eq("id", matchWinnerId);

    await supabase
      .from("teams")
      .update({ win_streak: 0 })
      .eq("id", matchLoserId);
    // --- END OF NEW LOGIC ---

    if (match.next_match_id && match.winner_advances_to_slot) {
      const update = {};
      if (match.winner_advances_to_slot === "team1") {
        update.team1_id = matchWinnerId;
      } else {
        update.team2_id = matchWinnerId;
      }

      await supabase
        .from("matches")
        .update(update)
        .eq("id", match.next_match_id);
    }

    if (player_stats && player_stats.length > 0) {
      const statsToUpsert = player_stats.map((stat) => ({
        match_id: match_id,
        player_id: stat.player_id,
        stats: stat.stats,
      }));

      await supabase
        .from("match_player_stats")
        .delete()
        .eq("match_id", match_id);

      const { error: statsError } = await supabase
        .from("match_player_stats")
        .insert(statsToUpsert);
      if (statsError) throw statsError;
    }

    const { error: predictionError } = await supabase.rpc(
      "update_prediction_statuses",
      {
        p_match_id: match_id,
        p_actual_winner_id: matchWinnerId,
      }
    );

    if (predictionError) throw predictionError;

    res.status(200).json({ message: "Match result logged successfully." });
  } catch (error) {
    console.error("Log Match Result Error:", error.message);
    res.status(500).json({ message: "Error logging match result." });
  }
};
