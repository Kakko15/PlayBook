import express from "express";
import {
  makePick,
  getMyPicks,
  getLeaderboard,
} from "../controllers/predictionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.use(protect); // Disabled to allow guest picks

router.post("/make-pick", makePick);
router.get("/:tournamentId/my-picks", getMyPicks);
router.get("/:tournamentId/leaderboard", getLeaderboard);

export default router;
