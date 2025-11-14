import express from "express";
import {
  getPublicTournaments,
  getPublicTournamentDetails,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/tournaments", getPublicTournaments);
router.get("/tournament/:id", getPublicTournamentDetails);

export default router;
