import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getPendingUniversities, verifyUniversity } from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/universities/pending", getPendingUniversities);
router.patch("/universities/:id/verify", verifyUniversity);

export default router;
