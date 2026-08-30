import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getMyProfile,
  updateMyProfile,
  getUniversityDashboard,
} from "../controllers/universityController.js";

const router = express.Router();

router.use(protect, authorize("university"));
router.get("/profile", getMyProfile);
router.patch("/profile", updateMyProfile);
router.get("/dashboard", getUniversityDashboard);

export default router;
