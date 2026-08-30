import User from "../models/User.js";
import Circular from "../models/Circular.js";
import Application from "../models/Application.js";

// @route GET /api/admin/universities/pending
export const getPendingUniversities = async (req, res) => {
  const pending = await User.find({
    role: "university",
    verificationStatus: "pending",
  }).select("-password");
  res.json(pending);
};

// @route PATCH /api/admin/universities/:id/verify
export const verifyUniversity = async (req, res) => {
  const { decision, reason } = req.body; // decision: "approved" | "rejected"
  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
  }
  const university = await User.findOne({ _id: req.params.id, role: "university" });
  if (!university) return res.status(404).json({ message: "University not found" });

  university.verificationStatus = decision;
  university.rejectionReason = decision === "rejected" ? reason : undefined;
  await university.save();

  res.json({ message: `University ${decision}`, university });
};

// ─── Feature 1: Manage Users ─────────────────────────────────────────────────

// @route GET /api/admin/users?role=student|university
// Admin sees all students and universities
export const getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role && ["student", "university"].includes(req.query.role)) {
      filter.role = req.query.role;
    } else {
      filter.role = { $in: ["student", "university"] };
    }
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/admin/users/:id/toggle-active
// Admin activates or deactivates any student/university account
export const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot deactivate admin accounts" });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `Account ${user.isActive ? "activated" : "deactivated"}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Feature 3: Admin Stats ───────────────────────────────────────────────────

// @route GET /api/admin/stats
// Quick counts for admin dashboard
export const getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalUniversities, pendingVerifications] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "university" }),
      User.countDocuments({ role: "university", verificationStatus: "pending" }),
    ]);
    res.json({ totalStudents, totalUniversities, pendingVerifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Feature 4: Analytics Dashboard ──────────────────────────────────────────

const APPLICATION_STATUSES = ["Submitted", "Under Review", "Shortlisted", "Accepted", "Rejected"];

// @route GET /api/admin/analytics
// Platform-wide stats and chart data for the admin Analytics Dashboard
export const getAnalytics = async (req, res) => {
  try {
    const [
      pendingUniversities,
      approvedUniversities,
      rejectedUniversities,
      totalCirculars,
      activeCirculars,
      statusCounts,
      signups,
    ] = await Promise.all([
      User.countDocuments({ role: "university", verificationStatus: "pending" }),
      User.countDocuments({ role: "university", verificationStatus: "approved" }),
      User.countDocuments({ role: "university", verificationStatus: "rejected" }),
      Circular.countDocuments({}),
      Circular.countDocuments({ isActive: true }),
      Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statusMap = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));
    const applicationStatusBreakdown = APPLICATION_STATUSES.map((status) => ({
      status,
      count: statusMap[status] || 0,
    }));

    const signupMap = Object.fromEntries(signups.map((s) => [s._id, s.count]));
    const signupsLast30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      signupsLast30Days.push({ date: key, count: signupMap[key] || 0 });
    }

    res.json({
      verificationBreakdown: {
        pending: pendingUniversities,
        approved: approvedUniversities,
        rejected: rejectedUniversities,
      },
      circularCounts: { total: totalCirculars, active: activeCirculars },
      applicationStatusBreakdown,
      signupsLast30Days,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
