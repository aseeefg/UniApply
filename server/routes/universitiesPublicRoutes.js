import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAllUniversities,
  getSavedUniversities,
  getUniversityById,
  toggleSaveUniversity,
} from "../controllers/universityController.js";

const router = express.Router();

// Public browsing
router.get("/", getAllUniversities);

// Student-only - must come before "/:id" so "saved" isn't treated as an ID
router.get("/saved/mine", protect, authorize("student"), getSavedUniversities);
router.post("/:id/save", protect, authorize("student"), toggleSaveUniversity);

// Public - single university detail (must come after "/saved")
router.get("/:id", getUniversityById);

export default router;
