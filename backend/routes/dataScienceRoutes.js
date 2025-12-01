import express from "express";
import {
  trainWinPredictor,
  getSimilarPlayers,
  getMatchPrediction,
  getGlobalAnalytics,
} from "../controllers/dataScienceController.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/global-analytics", protect, isSuperAdmin, getGlobalAnalytics);

router.post("/train/win-predictor", protect, isSuperAdmin, trainWinPredictor);

router.get("/similar-players/:playerId", protect, getSimilarPlayers);
router.get("/predict/match/:matchId", protect, getMatchPrediction);

export default router;
