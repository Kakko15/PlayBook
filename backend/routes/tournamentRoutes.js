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
  updatePlayer,
  deletePlayer,
  generateSchedule,
  generatePlayoffBracket,
  getSchedule,
  getStandings,
  getMatchDetails,
  logMatchResult,
} from "../controllers/tournamentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createTournament);
router.get("/my-tournaments", getMyTournaments);

router.get("/:id", getTournamentById);
router.put("/:id", updateTournament);
router.delete("/:id", deleteTournament);

router.get("/:tournamentId/teams", getTeams);
router.post("/:tournamentId/teams", addTeam);
router.put("/teams/:teamId", updateTeam);
router.delete("/teams/:teamId", deleteTeam);

router.get("/teams/:teamId/players", getPlayers);
router.post("/teams/:teamId/players", addPlayer);
router.put("/players/:playerId", updatePlayer);
router.delete("/players/:playerId", deletePlayer);

router.post("/:id/schedule/generate", generateSchedule);
router.post("/:id/playoffs/generate", generatePlayoffBracket);
router.get("/:id/schedule", getSchedule);
router.get("/:id/standings", getStandings);

router.get("/match/:id", getMatchDetails);
router.put("/match/:id/log", logMatchResult);

export default router;
