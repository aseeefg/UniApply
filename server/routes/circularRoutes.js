import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createCircular,
  getAllCirculars,
  getMyCirculars,
  getCircularById,
  updateCircular,
  deleteCircular,
} from "../controllers/circularController.js";

const router = express.Router();

// Public - anyone can browse circulars
router.get("/", getAllCirculars);

// University-only - must come before "/:id" so "mine" isn't treated as an ID
router.get("/mine", protect, authorize("university"), getMyCirculars);
router.post("/", protect, authorize("university"), createCircular);
router.patch("/:id", protect, authorize("university"), updateCircular);
router.delete("/:id", protect, authorize("university"), deleteCircular);

// Public - single circular detail (must come after "/mine")
router.get("/:id", getCircularById);

export default router;
