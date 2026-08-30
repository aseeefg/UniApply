import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getPendingUniversities,
  verifyUniversity,
  getAllUsers,
  toggleUserActive,
  getAdminStats,
  getAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, authorize("admin"));

// Existing
router.get("/universities/pending", getPendingUniversities);
router.patch("/universities/:id/verify", verifyUniversity);

// Feature 1 - Manage Users
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle-active", toggleUserActive);

// Stats
router.get("/stats", getAdminStats);

// Feature 4 - Analytics Dashboard
router.get("/analytics", getAnalytics);

export default router;
