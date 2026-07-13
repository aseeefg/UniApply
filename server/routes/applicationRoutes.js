import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  submitApplication,
  getMyApplications,
  getApplicationById,
} from "../controllers/applicationController.js";

const router = express.Router();

router.use(protect, authorize("student"));
router.post("/", submitApplication);
router.get("/mine", getMyApplications);
router.get("/:id", getApplicationById);

export default router;
