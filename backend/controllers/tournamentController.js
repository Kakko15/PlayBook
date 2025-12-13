import supabase from "../supabaseClient.js";
import { calculateElo } from "../utils/tournamentLogic.js";
import { sanitize, sanitizeObject } from "../utils/sanitize.js";

// Default venues for auto-generation during schedule creation
const DEFAULT_VENUES = ["Open Gym", "Closed Gym"];

export const createTournament = async (req, res, next) => {
  const { name, game, start_date, end_date } = req.body;
  const ownerId = req.user.userId;

  if (!name || !game || !start_date || !end_date) {
    return res
      .status(400)
      .json({ message: "Name, game, start date, and end date are required." });
  }

  try {
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .insert({
        name: sanitize(name),
        game: sanitize(game),
        owner_id: ownerId,
        start_date: start_date,
        end_date: end_date,
      })
      .select()
      .single();

    if (tournamentError) return next(tournamentError);

    if (!tournament) {
      return res
        .status(500)
        .json({ message: "Tournament creation failed to return data." });
    }

    const { error: collaboratorError } = await supabase
      .from("collaborators")
      .insert({
        tournament_id: tournament.id,
        user_id: ownerId,
        role: "owner",
      });

    if (collaboratorError) {
      console.error("Error adding collaborator:", collaboratorError);
    }

    const { data: departments, error: deptError } = await supabase
      .from("departments")
      .select("id, name, acronym");

    if (deptError) {
      console.error(
        "Failed to fetch departments for auto-population:",
        deptError
      );
    } else if (departments && departments.length > 0) {
      const teamsToInsert = departments.map((dept) => ({
        tournament_id: tournament.id,
        department_id: dept.id,
        name: sanitize(dept.name),
        logo_url: null,
        wins: 0,
        losses: 0,
        elo_rating: 1200,
      }));

      const { error: teamsError } = await supabase
        .from("teams")
        .insert(teamsToInsert);

      if (teamsError) {
        console.error("Failed to auto-populate teams:", teamsError);
      } else {
        await supabase.rpc("log_activity", {
          p_icon: "groups",
          p_color: "text-green-600",
          p_title: "Teams Auto-Populated",
          p_description: `Added ${teamsToInsert.length} department teams to ${tournament.name}.`,
          p_tournament_id: tournament.id,
          p_user_id: ownerId,
        });
      }
    }

    res.status(201).json(tournament);
  } catch (error) {
    next(error);
  }
};

export const getMyTournaments = async (req, res, next) => {
  const userId = req.user.userId;

  try {
    const { data: collabData, error: collabError } = await supabase
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

    if (!collabError && collabData && collabData.length > 0) {
      return res.status(200).json(collabData);
    }

    const { data, error } = await supabase
      .from("tournaments")
      .select(
        `
        id, name, game, start_date, end_date,
        teams(count)
      `
      )
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error) return next(error);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getTournamentById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const { data: collabData, error: collabError } = await supabase
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

    if (!collabError && collabData) {
      return res.status(200).json(collabData);
    }

    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .eq("owner_id", userId)
      .single();

    if (error) return next(error);
    if (!data) {
      return res
        .status(404)
        .json({ message: "Tournament not found or access denied." });
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateTournament = async (req, res, next) => {
  const { id } = req.params;
  const { name, game, startDate, endDate, registrationOpen } = req.body;

  const updates = {
    name: sanitize(name),
    game: sanitize(game),
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

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteTournament = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) return next(error);
    res.status(200).json({ message: "Tournament deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const getTeams = async (req, res, next) => {
  const { tournamentId } = req.params;
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("*, players(count), department:departments(acronym)")
      .eq("tournament_id", tournamentId)
      .order("name", { ascending: true });

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const addTeam = async (req, res, next) => {
  const { tournamentId } = req.params;
  const { name, department_id, logo_url } = req.body;
  const { userId } = req.user;

  if (!department_id) {
    return res.status(400).json({ message: "Department is required." });
  }

  try {
    const { data: department, error: deptError } = await supabase
      .from("departments")
      .select("name, acronym")
      .eq("id", department_id)
      .single();

    if (deptError) return next(deptError);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    const { data, error } = await supabase
      .from("teams")
      .insert({
        name: sanitize(name) || sanitize(department.name),
        logo_url: logo_url ? sanitize(logo_url) : null,
        tournament_id: tournamentId,
        department_id: department_id,
      })
      .select()
      .single();

    if (error) return next(error);

    await supabase.rpc("log_activity", {
      p_icon: "group_add",
      p_color: "text-blue-600",
      p_title: "New Team Added",
      p_description: `"${sanitize(department.name)}" joined a tournament.`,
      p_tournament_id: tournamentId,
      p_user_id: userId,
    });

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  const { teamId } = req.params;
  const { name, department_id, logo_url } = req.body;

  const updates = {
    department_id: department_id,
  };

  if (name) updates.name = sanitize(name);
  if (logo_url) updates.logo_url = sanitize(logo_url);

  try {
    const { data, error } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", teamId)
      .select()
      .single();

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  const { teamId } = req.params;
  try {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) return next(error);
    res.status(200).json({ message: "Team deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const getPlayers = async (req, res, next) => {
  const { teamId } = req.params;
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .order("name", { ascending: true });

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const addPlayer = async (req, res, next) => {
  const { teamId } = req.params;
  const { name, game_specific_data } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Player name is required." });
  }

  try {
    const { data, error } = await supabase
      .from("players")
      .insert({
        name: sanitize(name),
        team_id: teamId,
        game_specific_data: sanitizeObject(game_specific_data) || null,
      })
      .select()
      .single();

    if (error) return next(error);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const updatePlayer = async (req, res, next) => {
  const { playerId } = req.params;
  const { name, game_specific_data } = req.body;

  try {
    const { data, error } = await supabase
      .from("players")
      .update({
        name: sanitize(name),
        game_specific_data: sanitizeObject(game_specific_data) || null,
      })
      .eq("id", playerId)
      .select()
      .single();

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req, res, next) => {
  const { playerId } = req.params;
  try {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId);
    if (error) return next(error);
    res.status(200).json({ message: "Player deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const bulkAddPlayers = async (req, res, next) => {
  const { tournamentId } = req.params;
  const { players } = req.body;

  if (!players || !Array.isArray(players) || players.length === 0) {
    return res.status(400).json({ message: "Player data is required." });
  }

  try {
    const { data: departments, error: deptError } = await supabase
      .from("departments")
      .select("id, acronym");
    if (deptError) return next(deptError);

    const deptMap = new Map(departments.map((d) => [d.acronym, d.id]));

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, department_id")
      .eq("tournament_id", tournamentId);
    if (teamsError) return next(teamsError);

    const teamMap = new Map(teams.map((t) => [t.department_id, t.id]));

    const playersToInsert = [];
    const skippedPlayers = [];

    for (const player of players) {
      const deptId = deptMap.get(player.department_acronym);
      if (!deptId) {
        skippedPlayers.push({ ...player, reason: "Department not found" });
        continue;
      }

      const teamId = teamMap.get(deptId);
      if (!teamId) {
        skippedPlayers.push({
          ...player,
          reason: `No team for ${player.department_acronym} in this tournament.`,
        });
        continue;
      }

      playersToInsert.push({
        name: sanitize(player.name),
        team_id: teamId,
      });
    }

    if (playersToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("players")
        .insert(playersToInsert);
      if (insertError) return next(insertError);
    }

    res.status(201).json({
      message: `Successfully added ${playersToInsert.length} players.`,
      skipped: skippedPlayers.length,
      skippedPlayers,
    });
  } catch (error) {
    next(error);
  }
};

export const generateSchedule = async (req, res, next) => {
  const { id: tournament_id } = req.params;
  const { userId } = req.user;

  try {
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("start_date, end_date")
      .eq("id", tournament_id)
      .single();

    if (tournamentError) return next(tournamentError);

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id")
      .eq("tournament_id", tournament_id);

    if (teamsError) return next(teamsError);
    if (teams.length < 2) {
      return res.status(400).json({
        message: "At least two teams are required to generate a schedule.",
      });
    }

    await supabase.from("matches").delete().eq("tournament_id", tournament_id);

    const shuffledTeams = teams.sort(() => Math.random() - 0.5);

    let currentLayer = shuffledTeams.map((t) => ({ type: "team", id: t.id }));
    let roundNumber = 1;
    let matchNodes = [];

    while (currentLayer.length > 1) {
      const nextLayer = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          const matchNode = {
            tempId: matchNodes.length,
            round: roundNumber,
            source1: currentLayer[i],
            source2: currentLayer[i + 1],
            nextMatchTempId: null,
            winnerSlot: null,
          };

          if (currentLayer[i].type === "match") {
            currentLayer[i].node.nextMatchTempId = matchNode.tempId;
            currentLayer[i].node.winnerSlot = "team1";
          }
          if (currentLayer[i + 1].type === "match") {
            currentLayer[i + 1].node.nextMatchTempId = matchNode.tempId;
            currentLayer[i + 1].node.winnerSlot = "team2";
          }

          matchNodes.push(matchNode);
          nextLayer.push({ type: "match", node: matchNode });
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }

      currentLayer = nextLayer;
      roundNumber++;
    }

    const totalRounds = roundNumber - 1;

    const getRoundName = (r, total) => {
      if (r === total) return "Finals";
      if (r === total - 1) return "Semifinals";
      if (r === total - 2) return "Quarterfinals";
      return `Round ${r}`;
    };

    // Group matches by round
    const matchesByRound = {};
    matchNodes.forEach((node) => {
      if (!matchesByRound[node.round]) {
        matchesByRound[node.round] = [];
      }
      matchesByRound[node.round].push(node);
    });

    const matchesToInsert = [];

    const startDate = new Date(tournament.start_date);
    const endDate = new Date(tournament.end_date);
    // Calculate total duration in days (inclusive)
    const totalDurationMs = endDate - startDate;
    const totalDurationDays = Math.max(
      1,
      Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24)) + 1
    );

    // Calculate days allocated per round to spread them out
    const daysPerRound = Math.floor(totalDurationDays / totalRounds);

    let currentScheduleDate = new Date(startDate);
    currentScheduleDate.setHours(9, 0, 0, 0); // Start at 9:00 AM

    const GAME_DURATION_MINUTES = 90;
    const LAST_GAME_START_HOUR = 17; // 5:00 PM

    for (let r = 1; r <= totalRounds; r++) {
      const roundMatches = matchesByRound[r] || [];

      // Calculate the target start date for this round based on the spread
      const targetRoundStartDate = new Date(startDate);
      targetRoundStartDate.setDate(
        startDate.getDate() + (r - 1) * daysPerRound
      );
      targetRoundStartDate.setHours(9, 0, 0, 0);

      // If the current scheduling cursor is behind the target start date (meaning previous round finished early),
      // jump ahead to the target date to spread out the schedule.
      if (currentScheduleDate < targetRoundStartDate) {
        currentScheduleDate = targetRoundStartDate;
      }

      // Ensure we always start a new round at 9 AM if we jumped days or if we are on the same day but want to reset (optional, but cleaner)
      // Actually, if we just finished a round at 2 PM and the target date is today, we might want to continue?
      // No, usually rounds are distinct. Let's force a new day start if we are jumping,
      // but if we are "late" (current > target), we just continue from next available slot.
      // The logic `currentScheduleDate = targetRoundStartDate` handles the jump and sets it to 9 AM.

      // If we didn't jump (because we are running late), we should still try to start fresh at 9 AM of the next day
      // if the previous round ended late in the day.
      if (currentScheduleDate.getHours() >= LAST_GAME_START_HOUR) {
        currentScheduleDate.setDate(currentScheduleDate.getDate() + 1);
        currentScheduleDate.setHours(9, 0, 0, 0);
      }

      for (const node of roundMatches) {
        // Auto-generate venue by cycling through the default venues list
        const venueIndex = matchesToInsert.length % DEFAULT_VENUES.length;

        matchesToInsert.push({
          tournament_id,
          round_name: getRoundName(node.round, totalRounds),
          status: "pending",
          team1_id: node.source1.type === "team" ? node.source1.id : null,
          team2_id: node.source2.type === "team" ? node.source2.id : null,
          match_date: currentScheduleDate.toISOString(),
          venue: DEFAULT_VENUES[venueIndex],
        });

        // Advance time
        currentScheduleDate.setMinutes(
          currentScheduleDate.getMinutes() + GAME_DURATION_MINUTES
        );

        // Check if we need to wrap to next day
        if (currentScheduleDate.getHours() >= LAST_GAME_START_HOUR) {
          currentScheduleDate.setDate(currentScheduleDate.getDate() + 1);
          currentScheduleDate.setHours(9, 0, 0, 0);
        }
      }
    }

    const { data: insertedMatches, error: insertError } = await supabase
      .from("matches")
      .insert(matchesToInsert)
      .select("id");

    if (insertError) {
      console.error("Error inserting matches:", insertError);
      return next(insertError);
    }

    // Update matches with next_match_id and winner_advances_to_slot
    for (let i = 0; i < matchNodes.length; i++) {
      const node = matchNodes[i];
      if (node.nextMatchTempId !== null) {
        const currentDbId = insertedMatches[i].id;
        const nextDbId = insertedMatches[node.nextMatchTempId].id;

        await supabase
          .from("matches")
          .update({
            next_match_id: nextDbId,
            winner_advances_to_slot: node.winnerSlot,
          })
          .eq("id", currentDbId);
      }
    }

    await supabase.rpc("log_activity", {
      p_icon: "calendar_month",
      p_color: "text-purple-600",
      p_title: "Schedule Generated",
      p_description: `A new schedule was generated for a tournament.`,
      p_tournament_id: tournament_id,
      p_user_id: userId,
    });

    res.status(201).json({ message: "Schedule generated successfully." });
  } catch (error) {
    next(error);
  }
};

export const generatePlayoffBracket = async (req, res, next) => {
  const { id: tournament_id } = req.params;
  const { numTeams } = req.body;

  if (![4, 8, 16].includes(numTeams)) {
    return res
      .status(400)
      .json({ message: "Number of teams must be 4, 8, or 16." });
  }

  res.status(200).json({
    message:
      "Please use the main Schedule tab to generate the tournament bracket.",
  });
};

export const getSchedule = async (req, res, next) => {
  const { id: tournament_id } = req.params;
  try {
    const { data, error } = await supabase
      .from("matches")
      .select(
        "*, team1:teams!matches_team1_id_fkey(*, department:departments(acronym)), team2:teams!matches_team2_id_fkey(*, department:departments(acronym))"
      )
      .eq("tournament_id", tournament_id)
      .order("match_date", { ascending: true, nullsFirst: true });

    if (error) return next(error);

    const matchesWithGameNumbers = data.map((match, index) => ({
      ...match,
      game_number: index + 1,
    }));

    res.status(200).json(matchesWithGameNumbers);
  } catch (error) {
    next(error);
  }
};

export const getPlayerRankings = async (req, res, next) => {
  const { tournamentId } = req.params;
  try {
    const { data, error } = await supabase
      .from("players")
      .select(
        "id, name, isu_ps, offensive_rating, defensive_rating, game_count, avg_sportsmanship, team:teams!inner(id, name, tournament_id, wins, losses)"
      )
      .eq("team.tournament_id", tournamentId)
      .order("isu_ps", { ascending: false });

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getStandings = async (req, res, next) => {
  const { id: tournament_id } = req.params;
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("*, department:departments(acronym)")
      .eq("tournament_id", tournament_id)
      .order("wins", { ascending: false })
      .order("losses", { ascending: true })
      .order("elo_rating", { ascending: false });

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getMatchDetails = async (req, res, next) => {
  const { id: match_id } = req.params;
  try {
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select(
        "*, team1:teams!matches_team1_id_fkey(*, players(*), department:departments(acronym)), team2:teams!matches_team2_id_fkey(*, players(*), department:departments(acronym)), match_player_stats(*)"
      )
      .eq("id", match_id)
      .single();

    if (matchError) return next(matchError);
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    res.status(200).json(match);
  } catch (error) {
    next(error);
  }
};

export const logMatchResult = async (req, res, next) => {
  const { id: match_id } = req.params;
  const {
    team1_score,
    team2_score,
    player_stats,
    match_date,
    round_name,
    venue,
  } = req.body;
  const { userId } = req.user;

  if (team1_score == null || team2_score == null) {
    return res.status(400).json({ message: "Team scores are required." });
  }

  try {
    console.log("Starting logMatchResult for match_id:", match_id);

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select(
        "*, tournament:tournaments!inner(*), team1:teams!matches_team1_id_fkey(*, department:departments!inner(id, elo_rating)), team2:teams!matches_team2_id_fkey(*, department:departments!inner(id, elo_rating))"
      )
      .eq("id", match_id)
      .single();

    if (matchError) {
      console.error("Error fetching match:", matchError);
      return next(matchError);
    }
    if (!match) return res.status(404).json({ message: "Match not found." });

    if (match.is_finalized) {
      return res
        .status(403)
        .json({ message: "This match is finalized and cannot be edited." });
    }

    if (!match.team1.department || !match.team2.department) {
      return res.status(400).json({
        message:
          "One or both teams are missing a department link. Cannot log result.",
      });
    }

    const wasCompleted = match.status === "completed";
    const oldWinnerId =
      match.team1_score > match.team2_score ? match.team1_id : match.team2_id;
    const oldLoserId =
      match.team1_score < match.team2_score ? match.team1_id : match.team2_id;

    const team1 = match.team1;
    const team2 = match.team2;
    const kFactor = match.tournament.k_factor || 32;

    const [newEloTeam1, newEloTeam2] = calculateElo(
      team1.elo_rating,
      team2.elo_rating,
      team1_score > team2_score ? 1 : 0,
      kFactor
    );

    const dept1 = match.team1.department;
    const dept2 = match.team2.department;
    const [newEloDept1, newEloDept2] = calculateElo(
      dept1.elo_rating,
      dept2.elo_rating,
      team1_score > team2_score ? 1 : 0,
      kFactor
    );

    const matchWinnerId = team1_score > team2_score ? team1.id : team2.id;
    const matchLoserId = team1_score < team2_score ? team1.id : team2.id;

    const updates = {
      match_date: match_date || match.match_date,
      round_name: sanitize(round_name) || match.round_name,
      team1_score: team1_score,
      team2_score: team2_score,
      status: "completed",
    };
    if (venue !== undefined && venue !== null && venue !== "") {
      updates.venue = sanitize(venue);
    }

    console.log("Updating match with:", updates);

    // 1. Update the match with scores, status, venue, etc.
    const { error: updateError } = await supabase
      .from("matches")
      .update(updates)
      .eq("id", match_id);

    if (updateError) {
      console.error("Error updating match:", updateError);
      return next(updateError);
    }

    // 2. Update team1 ELO and win/loss
    if (!wasCompleted) {
      // First time completing - add wins/losses
      await supabase
        .from("teams")
        .update({
          elo_rating: newEloTeam1,
          wins: team1_score > team2_score ? team1.wins + 1 : team1.wins,
          losses: team1_score < team2_score ? team1.losses + 1 : team1.losses,
        })
        .eq("id", team1.id);

      await supabase
        .from("teams")
        .update({
          elo_rating: newEloTeam2,
          wins: team2_score > team1_score ? team2.wins + 1 : team2.wins,
          losses: team2_score < team1_score ? team2.losses + 1 : team2.losses,
        })
        .eq("id", team2.id);
    } else {
      // Re-logging - just update ELO
      await supabase
        .from("teams")
        .update({ elo_rating: newEloTeam1 })
        .eq("id", team1.id);

      await supabase
        .from("teams")
        .update({ elo_rating: newEloTeam2 })
        .eq("id", team2.id);
    }

    // 3. Update department ELOs (only if different departments)
    if (dept1.id !== dept2.id) {
      await supabase
        .from("departments")
        .update({ elo_rating: newEloDept1 })
        .eq("id", dept1.id);

      await supabase
        .from("departments")
        .update({ elo_rating: newEloDept2 })
        .eq("id", dept2.id);
    }

    // 4. Handle winner advancement to next match
    if (match.next_match_id && match.winner_advances_to_slot) {
      const updateField =
        match.winner_advances_to_slot === "team1" ? "team1_id" : "team2_id";
      await supabase
        .from("matches")
        .update({ [updateField]: matchWinnerId })
        .eq("id", match.next_match_id);
    }

    // 5. Save player stats if provided
    if (player_stats && player_stats.length > 0) {
      for (const stat of player_stats) {
        if (stat.player_id && stat.stats) {
          // Delete existing stats for this player in this match
          await supabase
            .from("match_player_stats")
            .delete()
            .eq("match_id", match_id)
            .eq("player_id", stat.player_id);

          // Insert new stats
          await supabase.from("match_player_stats").insert({
            match_id: match_id,
            player_id: stat.player_id,
            stats: stat.stats,
          });
        }
      }
    }

    // 6. Log activity
    await supabase.rpc("log_activity", {
      p_icon: "sports_score",
      p_color: "text-green-600",
      p_title: "Match Result Logged",
      p_description: `${team1.name} ${team1_score} - ${team2_score} ${team2.name}`,
      p_tournament_id: match.tournament_id,
      p_user_id: userId,
    });

    res.status(200).json({ message: "Match result logged successfully." });
  } catch (error) {
    console.error("Error in logMatchResult:", error);
    next(error);
  }
};

export const finalizeMatch = async (req, res, next) => {
  const { id: match_id } = req.params;
  const { userId } = req.user;

  try {
    const { data: match, error: finalizeError } = await supabase
      .from("matches")
      .update({ is_finalized: true })
      .eq("id", match_id)
      .select("id, tournament_id, tournament:tournaments(game)")
      .single();

    if (finalizeError) return next(finalizeError);
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    const game = match.tournament.game;
    if (game) {
      const { error: metricsError } = await supabase.rpc(
        "calculate_player_metrics",
        { p_game_type: game }
      );
      if (metricsError) {
        console.error(
          "Failed to update player metrics on finalization:",
          metricsError
        );
      }
    }

    await supabase.rpc("log_activity", {
      p_icon: "lock",
      p_color: "text-blue-600",
      p_title: "Match Finalized",
      p_description: `Match ID ${match.id} was finalized and locked.`,
      p_tournament_id: match.tournament_id,
      p_user_id: userId,
    });

    res.status(200).json({ message: "Match finalized and analytics updated." });
  } catch (error) {
    next(error);
  }
};

export const clearSchedule = async (req, res, next) => {
  const { id: tournament_id } = req.params;
  const { userId } = req.user;

  try {
    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("tournament_id", tournament_id);

    if (error) return next(error);

    await supabase.rpc("log_activity", {
      p_icon: "delete",
      p_color: "text-red-600",
      p_title: "Schedule Cleared",
      p_description: `The tournament schedule has been cleared.`,
      p_tournament_id: tournament_id,
      p_user_id: userId,
    });

    res.status(200).json({ message: "Schedule cleared successfully." });
  } catch (error) {
    next(error);
  }
};

export const resetElos = async (req, res, next) => {
  const { id: tournamentId } = req.params;
  const { userId } = req.user;

  try {
    // Reset team ELO, wins, and losses for this tournament
    const { error: teamError } = await supabase
      .from("teams")
      .update({ elo_rating: 1200, wins: 0, losses: 0 })
      .eq("tournament_id", tournamentId);

    if (teamError) return next(teamError);

    // Reset ALL department ELO ratings to 1200
    // We use .neq("id", "") to include all rows since Supabase requires a filter
    const { error: deptError } = await supabase
      .from("departments")
      .update({ elo_rating: 1200 })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // This filter matches all real IDs

    if (deptError) return next(deptError);

    await supabase.rpc("log_activity", {
      p_icon: "restart_alt",
      p_color: "text-orange-600",
      p_title: "Standings Reset",
      p_description: `ELO ratings, wins, and losses were reset for all teams and departments.`,
      p_tournament_id: tournamentId,
      p_user_id: userId,
    });

    res
      .status(200)
      .json({ message: "Standings and ELO ratings reset successfully." });
  } catch (error) {
    next(error);
  }
};

// Mock player names for realistic simulation
const MOCK_PLAYER_NAMES = [
  "James Santos",
  "Miguel Reyes",
  "Carlos Garcia",
  "Angelo Cruz",
  "Rafael Mendoza",
  "Luis Torres",
  "Daniel Ramos",
  "Marco Dela Cruz",
  "Kevin Fernandez",
  "Patrick Gonzales",
  "Mark Rodriguez",
  "Jerome Castro",
  "Ryan Villanueva",
  "Christian Bautista",
  "John Aquino",
  "Michael Lim",
  "Paolo Tan",
  "Josue Rivera",
  "Adrian Sy",
  "Francis Chua",
  "Vincent Ong",
  "Nathan Yap",
  "Timothy Go",
  "Emmanuel Lee",
  "Antonio Co",
  "Rico Velasco",
  "Gabriel Flores",
  "Ivan Morales",
  "Bryan Pascual",
  "Lorenzo Diaz",
  "Enrique Salazar",
  "Frederic Navarro",
  "Oscar Padilla",
  "Nicholas Romero",
  "Eduardo Mercado",
  "Roberto Aquino",
  "Steven Cruz",
  "Dennis Lim",
  "Ronald Santos",
  "Frederick Reyes",
  "Andrew Garcia",
  "Benjamin Torres",
  "Christopher Ramos",
  "David Mendoza",
  "Edward Fernandez",
  "Franklin Gonzales",
  "George Rodriguez",
  "Henry Castro",
  "Isaac Villanueva",
  "Jacob Bautista",
];

// Helper function to distribute total points among players
const distributePoints = (totalPoints, numPlayers) => {
  if (numPlayers === 0) return [];

  const points = [];
  let remaining = totalPoints;

  for (let i = 0; i < numPlayers - 1; i++) {
    // Give each player between 5-30% of remaining points
    const maxShare = Math.min(remaining, Math.floor(totalPoints * 0.35));
    const minShare = Math.floor(totalPoints * 0.05);
    const share =
      Math.floor(Math.random() * (maxShare - minShare + 1)) + minShare;
    points.push(Math.max(0, share));
    remaining -= share;
  }

  // Last player gets the rest
  points.push(Math.max(0, remaining));

  // Shuffle so high scorer isn't always last
  return points.sort(() => Math.random() - 0.5);
};

// Helper function to generate realistic basketball stats based on points
const generateBasketballStats = (points) => {
  // Calculate field goals based on points
  // Average: 2-point FG = 2pts, 3-point FG = 3pts, FT = 1pt
  const threePointers = Math.floor(
    Math.random() * Math.min(5, Math.floor(points / 3))
  );
  const threePointAttempts = threePointers + Math.floor(Math.random() * 3);
  const pointsFromThrees = threePointers * 3;

  const freeThrows = Math.floor(
    Math.random() * Math.min(8, Math.floor((points - pointsFromThrees) / 2))
  );
  const freeThrowAttempts = freeThrows + Math.floor(Math.random() * 3);
  const pointsFromFT = freeThrows;

  const remainingPoints = Math.max(0, points - pointsFromThrees - pointsFromFT);
  const twoPointers = Math.floor(remainingPoints / 2);
  const fieldGoals = twoPointers + threePointers;
  const fieldGoalAttempts = fieldGoals + Math.floor(Math.random() * 6) + 2;

  const minutes = Math.floor(Math.random() * 25) + 10; // 10-35 minutes
  const rebounds = Math.floor(Math.random() * 10);
  const offRebounds = Math.floor(Math.random() * Math.min(3, rebounds));
  const defRebounds = rebounds - offRebounds;
  const assists = Math.floor(Math.random() * 8);
  const steals = Math.floor(Math.random() * 4);
  const blocks = Math.floor(Math.random() * 3);
  const turnovers = Math.floor(Math.random() * 5);
  const fouls = Math.floor(Math.random() * 5);

  return {
    minutes_played: minutes,
    pts: points,
    fg_made: fieldGoals,
    fg_attempted: fieldGoalAttempts,
    three_pt_made: threePointers,
    three_pt_attempted: threePointAttempts,
    ft_made: freeThrows,
    ft_attempted: freeThrowAttempts,
    reb: rebounds,
    oreb: offRebounds,
    dreb: defRebounds,
    ast: assists,
    steals: steals,
    blocks: blocks,
    turnovers: turnovers,
    personal_fouls: fouls,
    technical_fouls: 0,
    fouls_drawn: Math.floor(Math.random() * 5),
    games_started: Math.random() > 0.5 ? 1 : 0,
    sportsmanship_rating: Math.floor(Math.random() * 2) + 4, // 4-5 rating
  };
};

export const generateMockTournament = async (req, res, next) => {
  const { id: tournamentId } = req.params;
  const { userId } = req.user;

  try {
    console.log("Starting mock tournament generation for:", tournamentId);

    // 1. Get tournament details
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("*, teams(id, name, department_id)")
      .eq("id", tournamentId)
      .single();

    if (tournamentError) return next(tournamentError);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    const teams = tournament.teams || [];
    if (teams.length < 2) {
      return res.status(400).json({
        message: "Tournament needs at least 2 teams to generate mock data.",
      });
    }

    // 2. Clear existing data (matches, player stats)
    await supabase.from("matches").delete().eq("tournament_id", tournamentId);

    // Reset team stats
    await supabase
      .from("teams")
      .update({ elo_rating: 1200, wins: 0, losses: 0 })
      .eq("tournament_id", tournamentId);

    // 3. Add mock players to each team (5 players per team)
    const shuffledNames = [...MOCK_PLAYER_NAMES].sort(
      () => Math.random() - 0.5
    );
    let nameIndex = 0;

    for (const team of teams) {
      // Delete existing players
      await supabase.from("players").delete().eq("team_id", team.id);

      // Add 5 new mock players
      const playersToAdd = [];
      for (let i = 0; i < 5; i++) {
        playersToAdd.push({
          team_id: team.id,
          name: shuffledNames[nameIndex % shuffledNames.length],
          isu_ps: Math.round((60 + Math.random() * 35) * 100) / 100,
          offensive_rating: Math.round((50 + Math.random() * 45) * 100) / 100,
          defensive_rating: Math.round((50 + Math.random() * 45) * 100) / 100,
          avg_sportsmanship: Math.round((70 + Math.random() * 30) * 100) / 100,
          game_count: Math.floor(3 + Math.random() * 5),
        });
        nameIndex++;
      }

      await supabase.from("players").insert(playersToAdd);
    }

    // 4. Generate bracket-style matches
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const matchesToInsert = [];
    const venues = ["Open Gym", "Closed Gym", "Main Court", "Auxiliary Court"];

    // Calculate rounds needed
    const numTeams = shuffledTeams.length;
    const rounds = Math.ceil(Math.log2(numTeams));

    let currentRoundTeams = shuffledTeams.map((t) => ({
      id: t.id,
      name: t.name,
    }));
    let matchDate = new Date(tournament.start_date);
    matchDate.setHours(9, 0, 0, 0);

    const roundNames = [];
    for (let r = 1; r <= rounds; r++) {
      if (r === rounds) roundNames.push("Finals");
      else if (r === rounds - 1) roundNames.push("Semifinals");
      else if (r === rounds - 2) roundNames.push("Quarterfinals");
      else roundNames.push(`Round ${r}`);
    }

    let allRoundData = [];

    for (let round = 0; round < rounds; round++) {
      const roundMatches = [];
      const nextRoundTeams = [];

      for (let i = 0; i < currentRoundTeams.length; i += 2) {
        if (i + 1 < currentRoundTeams.length) {
          const team1 = currentRoundTeams[i];
          const team2 = currentRoundTeams[i + 1];

          // Generate random scores - ensure no draws in basketball
          let score1 = Math.floor(Math.random() * 35) + 65;
          let score2 = Math.floor(Math.random() * 35) + 65;

          // If scores are equal, add 1-5 points to a random team to break the tie
          if (score1 === score2) {
            const tiebreaker = Math.floor(Math.random() * 5) + 1;
            if (Math.random() > 0.5) {
              score1 += tiebreaker;
            } else {
              score2 += tiebreaker;
            }
          }

          const winner = score1 > score2 ? team1 : team2;

          roundMatches.push({
            tournament_id: tournamentId,
            team1_id: team1.id,
            team2_id: team2.id,
            team1_score: score1,
            team2_score: score2,
            round_name: roundNames[round],
            status: "completed",
            is_finalized: true,
            venue: venues[i % venues.length],
            match_date: new Date(matchDate).toISOString(),
          });

          nextRoundTeams.push(winner);

          // Advance time
          matchDate.setMinutes(matchDate.getMinutes() + 90);
          if (matchDate.getHours() >= 17) {
            matchDate.setDate(matchDate.getDate() + 1);
            matchDate.setHours(9, 0, 0, 0);
          }
        } else {
          // Bye - team advances automatically
          nextRoundTeams.push(currentRoundTeams[i]);
        }
      }

      allRoundData.push({ matches: roundMatches, winners: nextRoundTeams });
      currentRoundTeams = nextRoundTeams;
    }

    // Insert all matches
    for (const roundData of allRoundData) {
      for (const match of roundData.matches) {
        matchesToInsert.push(match);
      }
    }

    const { data: insertedMatches, error: matchInsertError } = await supabase
      .from("matches")
      .insert(matchesToInsert)
      .select();

    if (matchInsertError) {
      console.error("Error inserting matches:", matchInsertError);
      return next(matchInsertError);
    }

    // 5.5 Create match_player_stats for each match
    console.log("Creating player stats for matches...");

    // First, get all players for each team
    const { data: allPlayers, error: playersError } = await supabase
      .from("players")
      .select("id, team_id, name")
      .in(
        "team_id",
        teams.map((t) => t.id)
      );

    if (playersError) {
      console.error("Error fetching players:", playersError);
    }

    // Create a map of team_id to players
    const teamPlayersMap = {};
    if (allPlayers) {
      allPlayers.forEach((player) => {
        if (!teamPlayersMap[player.team_id]) {
          teamPlayersMap[player.team_id] = [];
        }
        teamPlayersMap[player.team_id].push(player);
      });
    }

    // Create match_player_stats for each match
    const allPlayerStats = [];
    for (let i = 0; i < insertedMatches.length; i++) {
      const match = insertedMatches[i];
      const matchData = matchesToInsert[i];

      // Get players for both teams
      const team1Players = teamPlayersMap[match.team1_id] || [];
      const team2Players = teamPlayersMap[match.team2_id] || [];

      // Calculate how many points each team's players should score
      const team1TotalPoints = matchData.team1_score;
      const team2TotalPoints = matchData.team2_score;

      // Generate stats for team 1 players
      const team1PointsDistribution = distributePoints(
        team1TotalPoints,
        team1Players.length
      );
      for (let j = 0; j < team1Players.length; j++) {
        const points = team1PointsDistribution[j] || 0;
        const statsObj = generateBasketballStats(points);
        allPlayerStats.push({
          match_id: match.id,
          player_id: team1Players[j].id,
          ...statsObj, // Spread as individual columns
        });
      }

      // Generate stats for team 2 players
      const team2PointsDistribution = distributePoints(
        team2TotalPoints,
        team2Players.length
      );
      for (let j = 0; j < team2Players.length; j++) {
        const points = team2PointsDistribution[j] || 0;
        const statsObj = generateBasketballStats(points);
        allPlayerStats.push({
          match_id: match.id,
          player_id: team2Players[j].id,
          ...statsObj, // Spread as individual columns
        });
      }
    }

    // Insert all player stats
    if (allPlayerStats.length > 0) {
      console.log(
        "Sample player stat record:",
        JSON.stringify(allPlayerStats[0], null, 2)
      );
      console.log(
        `Attempting to insert ${allPlayerStats.length} player stat records...`
      );

      const { data: insertedStats, error: statsError } = await supabase
        .from("match_player_stats")
        .insert(allPlayerStats)
        .select();

      if (statsError) {
        console.error("Error inserting player stats:", statsError);
        console.error("Error details:", JSON.stringify(statsError, null, 2));
      } else {
        console.log(
          `Successfully created ${insertedStats?.length || 0} player stat records`
        );
      }
    } else {
      console.log("No player stats to insert - allPlayerStats is empty");
    }

    // 5. Update team standings based on match results
    const teamStats = {};
    teams.forEach((team) => {
      teamStats[team.id] = { wins: 0, losses: 0, elo: 1200 };
    });

    console.log("Processing match results for team stats...");
    for (const match of matchesToInsert) {
      const winnerId =
        match.team1_score > match.team2_score ? match.team1_id : match.team2_id;
      const loserId =
        match.team1_score > match.team2_score ? match.team2_id : match.team1_id;

      if (teamStats[winnerId]) {
        teamStats[winnerId].wins++;
        teamStats[winnerId].elo += Math.floor(20 + Math.random() * 15);
      }
      if (teamStats[loserId]) {
        teamStats[loserId].losses++;
        teamStats[loserId].elo -= Math.floor(10 + Math.random() * 10);
      }
    }

    console.log("Team stats calculated:", JSON.stringify(teamStats, null, 2));

    // Update teams with their stats - using Promise.all for better reliability
    const updatePromises = Object.keys(teamStats).map(async (teamId) => {
      const stats = teamStats[teamId];
      console.log(
        `Updating team ${teamId}: W=${stats.wins}, L=${stats.losses}, ELO=${stats.elo}`
      );

      const { error: updateError } = await supabase
        .from("teams")
        .update({
          wins: stats.wins,
          losses: stats.losses,
          elo_rating: stats.elo,
        })
        .eq("id", teamId);

      if (updateError) {
        console.error(`Error updating team ${teamId}:`, updateError);
      }
      return { teamId, success: !updateError };
    });

    const updateResults = await Promise.all(updatePromises);
    console.log("Team update results:", updateResults);

    // 6. Log activity
    await supabase.rpc("log_activity", {
      p_icon: "science",
      p_color: "text-purple-600",
      p_title: "Mock Tournament Generated",
      p_description: `Generated ${teams.length * 5} players and ${matchesToInsert.length} completed matches for ${tournament.name}.`,
      p_tournament_id: tournamentId,
      p_user_id: userId,
    });

    // Find the champion (last match winner)
    const lastMatch = matchesToInsert[matchesToInsert.length - 1];
    const championId =
      lastMatch.team1_score > lastMatch.team2_score
        ? lastMatch.team1_id
        : lastMatch.team2_id;
    const champion = teams.find((t) => t.id === championId);

    res.status(200).json({
      message: "Mock tournament generated successfully!",
      stats: {
        playersGenerated: teams.length * 5,
        matchesPlayed: matchesToInsert.length,
        champion: champion?.name || "Unknown",
      },
    });
  } catch (error) {
    console.error("Error generating mock tournament:", error);
    next(error);
  }
};
