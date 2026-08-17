import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getMyProfile, updateMyProfile } from "../controllers/universityController.js";

const router = express.Router();

router.use(protect, authorize("university"));
router.get("/profile", getMyProfile);
router.patch("/profile", updateMyProfile);

export default router;
