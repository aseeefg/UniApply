import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getApplicantsForCircular,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

const router = express.Router();

// Student-only endpoints
router.post("/", protect, authorize("student"), submitApplication);
router.get("/mine", protect, authorize("student"), getMyApplications);
router.get("/:id", protect, authorize("student"), getApplicationById);

// University-only endpoints (Feature 4)
router.get("/circular/:circularId", protect, authorize("university"), getApplicantsForCircular);
router.patch("/:id/status", protect, authorize("university"), updateApplicationStatus);

export default router;
