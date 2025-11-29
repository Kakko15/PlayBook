import express from "express";
import {
  getPublicTournaments,
  getPublicTournamentDetails,
  getLiveMatches,
  getLeaderboard,
  getNextMatch,
  getTopPlayer,
  getAnnouncements,
  getRecentMatches,
  getMatchPrediction,
  getAllTeams,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/tournaments", getPublicTournaments);
router.get("/live-matches", getLiveMatches);
router.get("/leaderboard", getLeaderboard);
router.get("/next-match", getNextMatch);
router.get("/top-player", getTopPlayer);
router.get("/announcements", getAnnouncements);
router.get("/recent-matches", getRecentMatches);
router.get("/match-prediction/:matchId", getMatchPrediction);
router.get("/all-teams", getAllTeams);
router.get("/tournament/:id", getPublicTournamentDetails);

export default router;
