import express from "express";
import {
  getPendingUsers,
  approveUser,
  getAllUsers,
  manageUserRole,
  manageUserStatus,
  deleteUser,
  createBackup,
  getBackups,
  restoreBackup,
  deleteBackup,
  resetUserPassword,
  clearActivityLog,
} from "../controllers/superAdminController.js";
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(isSuperAdmin);

router.get("/users/pending", getPendingUsers);
router.put("/users/approve/:id", approveUser);
router.get("/users/all", getAllUsers);
router.put("/users/role/:id", manageUserRole);
router.put("/users/status/:id", manageUserStatus);
router.put("/users/reset-password/:id", resetUserPassword);
router.delete("/users/delete/:id", deleteUser);

router.post("/system/backup", createBackup);
router.get("/system/backups", getBackups);
router.post("/system/restore", restoreBackup);
router.delete("/system/backup/:id", deleteBackup);

router.delete("/activity/clear", clearActivityLog);

export default router;
