import express from "express";
import {
  createTournament,
  getMyTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  getTeams,
  addTeam,
  updateTeam,
  deleteTeam,
  getPlayers,
  addPlayer,
  bulkAddPlayers,
  updatePlayer,
  deletePlayer,
  generateSchedule,
  clearSchedule,
  generatePlayoffBracket,
  getSchedule,
  getPlayerRankings,
  getStandings,
  getMatchDetails,
  logMatchResult,
  finalizeMatch,
  resetElos,
} from "../controllers/tournamentController.js";
import {
  protect,
  isScorerOrAdmin,
  isAdminOrSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes (No Auth Required)
router.get("/:id/schedule", getSchedule);
router.get("/:id/standings", getStandings);
router.get("/:tournamentId/rankings/players", getPlayerRankings);
router.get("/:tournamentId/teams", getTeams);
router.get("/teams/:teamId/players", getPlayers);
router.get("/match/:id", getMatchDetails);

router.use(protect);

router.post("/", createTournament);
router.get("/my-tournaments", getMyTournaments);

router.get("/:id", getTournamentById);
router.put("/:id", updateTournament);
router.delete("/:id", deleteTournament);

router.post("/:tournamentId/teams", addTeam);
router.put("/teams/:teamId", updateTeam);
router.delete("/teams/:teamId", deleteTeam);

router.post("/teams/:teamId/players", addPlayer);
router.post("/:tournamentId/players/bulk-upload", bulkAddPlayers);
router.put("/players/:playerId", updatePlayer);
router.delete("/players/:playerId", deletePlayer);

router.post("/:id/schedule/generate", generateSchedule);
router.delete("/:id/schedule", clearSchedule);
router.post("/:id/playoffs/generate", generatePlayoffBracket);
router.put("/match/:id/log", isScorerOrAdmin, logMatchResult);
router.post("/match/:id/finalize", isAdminOrSuperAdmin, finalizeMatch);
router.put("/:id/elo/reset", isAdminOrSuperAdmin, resetElos);

export default router;
