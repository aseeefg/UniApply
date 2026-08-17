import Circular from "../models/Circular.js";

// @route POST /api/circulars
// University creates a new circular
export const createCircular = async (req, res) => {
  try {
    const {
      programName,
      department,
      degreeLevel,
      seatsAvailable,
      minRequirements,
      applicationFee,
      deadline,
    } = req.body;

    if (!programName || !department || !seatsAvailable || !minRequirements || !applicationFee || !deadline) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const circular = await Circular.create({
      university: req.user._id,
      programName,
      department,
      degreeLevel,
      seatsAvailable,
      minRequirements,
      applicationFee,
      deadline,
    });

    res.status(201).json(circular);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/circulars
// Public - list all active circulars with optional filtering (Feature 2)
// Query params: degreeLevel, department, location, deadlineBefore (ISO date string)
export const getAllCirculars = async (req, res) => {
  try {
    const { degreeLevel, department, location, deadlineBefore } = req.query;

    const filter = { isActive: true };

    if (degreeLevel) {
      filter.degreeLevel = { $regex: degreeLevel, $options: "i" };
    }
    if (department) {
      filter.department = { $regex: department, $options: "i" };
    }
    if (deadlineBefore) {
      filter.deadline = { $lte: new Date(deadlineBefore) };
    }

    let query = Circular.find(filter)
      .populate("university", "name universityProfile.universityName universityProfile.location")
      .sort({ deadline: 1 });

    const circulars = await query;

    // Filter by university location after populate (location lives inside universityProfile)
    const filtered = location
      ? circulars.filter((c) =>
          c.university?.universityProfile?.location
            ?.toLowerCase()
            .includes(location.toLowerCase())
        )
      : circulars;

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/circulars/mine
// University - list only their own circulars (feeds the University Dashboard)
export const getMyCirculars = async (req, res) => {
  const circulars = await Circular.find({ university: req.user._id }).sort({ createdAt: -1 });
  res.json(circulars);
};

// @route GET /api/circulars/:id
export const getCircularById = async (req, res) => {
  const circular = await Circular.findById(req.params.id).populate(
    "university",
    "name universityProfile"
  );
  if (!circular) return res.status(404).json({ message: "Circular not found" });
  res.json(circular);
};

// @route PATCH /api/circulars/:id
// University - edit their own circular
export const updateCircular = async (req, res) => {
  const circular = await Circular.findById(req.params.id);
  if (!circular) return res.status(404).json({ message: "Circular not found" });
  if (String(circular.university) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not your circular" });
  }

  const allowedFields = [
    "programName",
    "department",
    "degreeLevel",
    "seatsAvailable",
    "minRequirements",
    "applicationFee",
    "deadline",
    "isActive",
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) circular[field] = req.body[field];
  });

  await circular.save();
  res.json(circular);
};

// @route DELETE /api/circulars/:id
// University - permanently remove their own circular
export const deleteCircular = async (req, res) => {
  const circular = await Circular.findById(req.params.id);
  if (!circular) return res.status(404).json({ message: "Circular not found" });
  if (String(circular.university) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not your circular" });
  }

  await circular.deleteOne();
  res.json({ message: "Circular deleted" });
};
