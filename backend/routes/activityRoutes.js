import express from "express";
import { getRecentActivity } from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/recent", getRecentActivity);

export default router;
