import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getMyStudentProfile, updateMyStudentProfile } from "../controllers/studentController.js";

const router = express.Router();

router.use(protect, authorize("student"));
router.get("/profile", getMyStudentProfile);
router.patch("/profile", updateMyStudentProfile);

export default router;
