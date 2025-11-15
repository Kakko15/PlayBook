import express from "express";
import {
  getRecentActivity,
  getAllActivity,
} from "../controllers/activityController.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/recent", getRecentActivity);
router.get("/all", isSuperAdmin, getAllActivity);

export default router;
