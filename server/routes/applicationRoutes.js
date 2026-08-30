import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getApplicantsForCircular,
  updateApplicationStatus,
  uploadDocuments,
} from "../controllers/applicationController.js";

const router = express.Router();

// Student-only endpoints
router.post("/", protect, authorize("student"), submitApplication);
router.get("/mine", protect, authorize("student"), getMyApplications);
router.get("/:id", protect, authorize("student"), getApplicationById);
router.post("/:id/documents", protect, authorize("student"), upload.array("documents"), uploadDocuments);

// University-only endpoints (Feature 4)
router.get("/circular/:circularId", protect, authorize("university"), getApplicantsForCircular);
router.patch("/:id/status", protect, authorize("university"), updateApplicationStatus);

export default router;
