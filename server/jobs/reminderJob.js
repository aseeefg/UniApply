/**
 * reminderJob.js — Deadline Reminder Notifications (Feature 3)
 *
 * Runs every day at midnight (via setInterval, no extra deps needed).
 * Finds circulars whose deadline falls within the next 3 days.
 * For each such circular, creates an in-app Notification for:
 *   - Students who have already applied to it
 *   - Students who have saved it
 * Skips if a notification for the same circular was already created today.
 */

import Circular from "../models/Circular.js";
import Application from "../models/Application.js";
import Notification from "../models/Notification.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function runDeadlineReminders() {
  try {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * MS_PER_DAY);

    // Find all active circulars whose deadline is within the next 3 days
    const urgentCirculars = await Circular.find({
      isActive: true,
      deadline: { $gte: now, $lte: in3Days },
    });

    if (urgentCirculars.length === 0) return;

    for (const circular of urgentCirculars) {
      const daysLeft = Math.ceil((new Date(circular.deadline) - now) / MS_PER_DAY);
      const message = `⏰ Deadline reminder: "${circular.programName}" closes in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Don't miss your chance to apply!`;

      // Collect student IDs: applicants + savers (de-duplicated)
      const applications = await Application.find({ circular: circular._id }).select("student");
      const applicantIds = applications.map((a) => String(a.student));
      const savedIds = (circular.savedBy || []).map(String);

      const uniqueStudentIds = [...new Set([...applicantIds, ...savedIds])];
      if (uniqueStudentIds.length === 0) continue;

      // Start of today (to avoid sending duplicate reminders on the same day)
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      for (const studentId of uniqueStudentIds) {
        // Check if we already sent a reminder today for this circular to this student
        const alreadySent = await Notification.findOne({
          user: studentId,
          circular: circular._id,
          createdAt: { $gte: todayStart },
        });
        if (alreadySent) continue;

        await Notification.create({
          user: studentId,
          circular: circular._id,
          message,
          read: false,
        });
      }
    }

    console.log(`[ReminderJob] Processed ${urgentCirculars.length} urgent circular(s).`);
  } catch (err) {
    console.error("[ReminderJob] Error:", err.message);
  }
}

/**
 * Start the reminder job. Fires once immediately on startup, then every 24 hours.
 */
export function startReminderJob() {
  console.log("[ReminderJob] Starting deadline reminder scheduler (runs every 24h)...");
  runDeadlineReminders(); // fire once at startup
  setInterval(runDeadlineReminders, MS_PER_DAY);
}
