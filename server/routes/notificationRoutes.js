import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getMyNotifications,
  markNotificationRead,
  markAllRead,
  toggleSaveCircular,
} from "../controllers/notificationController.js";

const router = express.Router();

// Notification endpoints — any authenticated user
router.get("/mine", protect, getMyNotifications);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markNotificationRead);

// Save/unsave a circular — students only
router.post("/circulars/:id/save", protect, authorize("student"), toggleSaveCircular);

export default router;
