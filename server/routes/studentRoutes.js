import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getMyStudentProfile,
  updateMyStudentProfile,
  getRecommendations,
  explainRecommendation,
} from "../controllers/studentController.js";

const router = express.Router();

router.use(protect, authorize("student"));
router.get("/profile", getMyStudentProfile);
router.patch("/profile", updateMyStudentProfile);
router.get("/recommendations", getRecommendations);
router.get("/recommendations/:circularId/explain", explainRecommendation);

export default router;
