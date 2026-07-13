import Application from "../models/Application.js";
import Circular from "../models/Circular.js";

// @route POST /api/applications
// Student applies to an open circular
export const submitApplication = async (req, res) => {
  const { circularId } = req.body;

  const circular = await Circular.findById(circularId);
  if (!circular || !circular.isActive) {
    return res.status(404).json({ message: "Circular not found or closed" });
  }
  if (new Date(circular.deadline) < new Date()) {
    return res.status(400).json({ message: "Application deadline has passed" });
  }

  const existing = await Application.findOne({ student: req.user._id, circular: circularId });
  if (existing) {
    return res.status(409).json({ message: "You already applied to this circular" });
  }

  const application = await Application.create({
    student: req.user._id,
    circular: circularId,
    status: "Submitted",
    statusHistory: [{ status: "Submitted" }],
  });

  res.status(201).json(application);
};

// @route GET /api/applications/mine
// Student's own application dashboard
export const getMyApplications = async (req, res) => {
  const applications = await Application.find({ student: req.user._id })
    .populate({
      path: "circular",
      select: "programName department deadline",
      populate: { path: "university", select: "name universityProfile.universityName" },
    })
    .sort({ createdAt: -1 });

  res.json(applications);
};

// @route GET /api/applications/:id
// Full status history for one application (student can only view their own)
export const getApplicationById = async (req, res) => {
  const application = await Application.findById(req.params.id).populate("circular");
  if (!application) return res.status(404).json({ message: "Application not found" });
  if (String(application.student) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not your application" });
  }
  res.json(application);
};
