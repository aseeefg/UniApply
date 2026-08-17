import Application from "../models/Application.js";
import Circular from "../models/Circular.js";
import Notification from "../models/Notification.js";

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
      select: "programName department deadline degreeLevel",
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

// ─── Feature 4: Applicant Management ─────────────────────────────────────────

// @route GET /api/applications/circular/:circularId
// University sees all applicants for one of their circulars
export const getApplicantsForCircular = async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.circularId);
    if (!circular) return res.status(404).json({ message: "Circular not found" });
    if (String(circular.university) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your circular" });
    }

    const applications = await Application.find({ circular: req.params.circularId })
      .populate("student", "name email studentProfile.phone studentProfile.hscResult studentProfile.aLevelResult")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/applications/:id/status
// University updates an applicant's status and appends to statusHistory
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Under Review", "Shortlisted", "Accepted", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const application = await Application.findById(req.params.id).populate("circular");
    if (!application) return res.status(404).json({ message: "Application not found" });

    // Verify university owns the circular
    if (String(application.circular.university) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your circular" });
    }

    application.status = status;
    application.statusHistory.push({ status, timestamp: new Date() });
    await application.save();

    // Notify the student of the status change
    await Notification.create({
      user: application.student,
      circular: application.circular._id,
      message: `Your application for "${application.circular.programName}" has been updated to: ${status}.`,
      read: false,
    });

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
