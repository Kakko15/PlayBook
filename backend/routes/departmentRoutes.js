import express from "express";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDepartments);
router.post("/", protect, isSuperAdmin, createDepartment);
router.put("/:id", protect, isSuperAdmin, updateDepartment);
router.delete("/:id", protect, isSuperAdmin, deleteDepartment);

export default router;
