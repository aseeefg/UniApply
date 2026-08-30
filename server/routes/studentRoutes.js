import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getMyStudentProfile,
  updateMyStudentProfile,
  uploadTranscript,
  getRecommendations,
  getRecommendedUniversities,
  explainRecommendation,
  checkEligibility,
  generateProgramSuggestions,
} from "../controllers/studentController.js";

const router = express.Router();

router.use(protect, authorize("student"));
router.get("/profile", getMyStudentProfile);
router.patch("/profile", updateMyStudentProfile);
router.post("/profile/transcript", upload.single("transcript"), uploadTranscript);
router.get("/recommendations", getRecommendations);
router.get("/recommendations/universities", getRecommendedUniversities);
router.get("/recommendations/:circularId/explain", explainRecommendation);
router.get("/eligibility/:circularId", checkEligibility);
router.post("/quiz", generateProgramSuggestions);

export default router;
