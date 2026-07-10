import User from "../models/User.js";

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
