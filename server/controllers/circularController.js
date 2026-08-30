import Circular from "../models/Circular.js";

// The 8 administrative divisions of Bangladesh - university locations are
// freeform text (e.g. "Palashi, Dhaka-1000"), so the location filter matches
// against whichever division name appears in that text rather than requiring
// an exact value.
const BD_DIVISIONS = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"];
const DIVISION_ALIASES = {
  Chittagong: ["chittagong", "chattogram"],
  Barisal: ["barisal", "barishal"],
};

const locationMatchesDivision = (locationText, division) => {
  if (!locationText) return false;
  const text = locationText.toLowerCase();
  const aliases = DIVISION_ALIASES[division] || [division.toLowerCase()];
  return aliases.some((alias) => text.includes(alias));
};

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Real department/program names are freeform institution text ("BRAC
// Business School", "Faculty of Business Studies") that will almost never
// contain a generic AI-suggested category like "Business Administration" as
// a whole-phrase substring. Matching word-by-word (skipping short/stop words)
// is what lets "Business Administration" surface a circular whose department
// is "Faculty of Business Studies" - it only needs to share "business".
//
// Requiring every word to match (AND) keeps that from getting too loose -
// without it, "Computer Science" would match "Faculty of Veterinary Science"
// on the word "science" alone. AND is tried first; only when it finds
// nothing do we fall back to matching any single word (OR), so a query with
// one word neither department shares in full still returns its closest hits
// instead of nothing.
const SEARCH_STOPWORDS = new Set(["and", "the", "for", "with", "of", "in", "a", "an"]);
const SEARCH_FIELDS = ["programName", "department"];

const searchWords = (q) =>
  q
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !SEARCH_STOPWORDS.has(w));

// Each word must appear in programName or department (any field, but every word)
const wordsMatchAllCondition = (words) => ({
  $and: words.map((w) => ({
    $or: SEARCH_FIELDS.map((field) => ({ [field]: new RegExp(escapeRegExp(w), "i") })),
  })),
});

// Any single word appearing in either field is enough
const wordsMatchAnyCondition = (words) => ({
  $or: SEARCH_FIELDS.flatMap((field) => words.map((w) => ({ [field]: new RegExp(escapeRegExp(w), "i") }))),
});

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
      minGPA,
      applicationFee,
      deadline,
    } = req.body;

    if (!programName || !department || !seatsAvailable || !minRequirements || !applicationFee || !deadline) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (new Date(deadline) < new Date()) {
      return res.status(400).json({ message: "Deadline must be in the future" });
    }

    const circular = await Circular.create({
      university: req.user._id,
      programName,
      department,
      degreeLevel,
      seatsAvailable,
      minRequirements,
      minGPA,
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
// Query params: degreeLevel, department, location (each a comma-separated list
// of exact values from /api/circulars/filter-options), deadlineBefore (ISO date),
// q (freeform search - e.g. from the Program Quiz's suggested category -
// matched word-by-word against programName/department, not exact)
export const getAllCirculars = async (req, res) => {
  try {
    const { degreeLevel, department, location, deadlineBefore, q } = req.query;

    const filter = { isActive: true };

    if (degreeLevel) {
      filter.degreeLevel = { $in: degreeLevel.split(",") };
    }
    if (department) {
      filter.department = { $in: department.split(",") };
    }
    if (deadlineBefore) {
      filter.deadline = { $lte: new Date(deadlineBefore) };
    }
    if (q) {
      const words = searchWords(q);
      if (words.length > 0) {
        const andCount = await Circular.countDocuments({ ...filter, ...wordsMatchAllCondition(words) });
        Object.assign(filter, andCount > 0 ? wordsMatchAllCondition(words) : wordsMatchAnyCondition(words));
      }
    }

    let query = Circular.find(filter)
      .populate("university", "name universityProfile.universityName universityProfile.location universityProfile.logo")
      .sort({ deadline: 1 });

    const circulars = await query;

    // Filter by university location after populate (location lives inside universityProfile).
    // "location" here is one or more division names; match if the university's
    // freeform location text mentions any of the selected divisions.
    const divisions = location ? location.split(",") : null;
    const filtered = divisions
      ? circulars.filter((c) =>
          divisions.some((div) => locationMatchesDivision(c.university?.universityProfile?.location, div))
        )
      : circulars;

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/circulars/filter-options
// Public - values to populate the filter dropdowns. Degree level and
// department are the real, currently-in-use values; location is always the
// fixed 8 divisions of Bangladesh rather than raw freeform address text.
export const getCircularFilterOptions = async (req, res) => {
  try {
    const [degreeLevels, departments] = await Promise.all([
      Circular.distinct("degreeLevel", { isActive: true, degreeLevel: { $nin: [null, ""] } }),
      Circular.distinct("department", { isActive: true }),
    ]);

    res.json({
      degreeLevels: degreeLevels.sort(),
      departments: departments.sort(),
      locations: BD_DIVISIONS,
    });
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
export const updateCircular = async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.id);
    if (!circular) return res.status(404).json({ message: "Circular not found" });

    if (circular.university.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this circular" });
    }

    if (req.body.deadline !== undefined && new Date(req.body.deadline) < new Date()) {
      return res.status(400).json({ message: "Deadline must be in the future" });
    }

    const allowedFields = [
      "programName", "department", "degreeLevel", "seatsAvailable",
      "minRequirements", "minGPA", "applicationFee", "deadline", "isActive",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) circular[field] = req.body[field];
    });

    await circular.save();
    res.status(200).json(circular);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route DELETE /api/circulars/:id
export const deleteCircular = async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.id);
    if (!circular) return res.status(404).json({ message: "Circular not found" });

    if (circular.university.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this circular" });
    }

    await circular.deleteOne();
    res.status(200).json({ message: "Circular deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
