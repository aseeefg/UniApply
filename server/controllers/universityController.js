import User from "../models/User.js";
import Circular from "../models/Circular.js";
import Application from "../models/Application.js";

// @route GET /api/university/profile
// Returns the logged-in university's own profile
export const getMyProfile = async (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email,
    verificationStatus: req.user.verificationStatus,
    universityProfile: req.user.universityProfile,
  });
};

// @route PATCH /api/university/profile
// Updates the logged-in university's profile fields
export const updateMyProfile = async (req, res) => {
  const { universityName, location, institutionType, logo, website, description, researchAreas, contactInfo } = req.body;

  const university = await User.findById(req.user._id);
  university.universityProfile = {
    ...university.universityProfile,
    ...(universityName && { universityName }),
    ...(location && { location }),
    ...(institutionType && { institutionType }),
    ...(logo && { logo }),
    ...(website && { website }),
    ...(description && { description }),
    ...(researchAreas && { researchAreas }),
    ...(contactInfo && { contactInfo }),
  };
  await university.save();

  res.json({ message: "Profile updated", universityProfile: university.universityProfile });
};

// ─── Saved Universities & Comparison Tool ────────────────────────────────────
// Public browsing + student bookmarking of universities, mounted separately
// at /api/universities (plural) since /api/university (singular, above) is
// locked to the university role for managing one's own profile.

// @route GET /api/universities
// Public - list approved universities with their active circular count
export const getAllUniversities = async (req, res) => {
  try {
    const universities = await User.find({
      role: "university",
      verificationStatus: "approved",
    }).select("name universityProfile");

    const withCounts = await Promise.all(
      universities.map(async (u) => {
        const activeCircularCount = await Circular.countDocuments({
          university: u._id,
          isActive: true,
        });
        return {
          _id: u._id,
          name: u.name,
          universityProfile: u.universityProfile,
          activeCircularCount,
        };
      })
    );

    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/universities/saved/mine
// Student - list universities they've bookmarked
export const getSavedUniversities = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).populate(
      "savedUniversities",
      "name universityProfile"
    );
    res.json(student.savedUniversities || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/universities/:id
// Public - single university profile plus its active circulars (for browsing/comparison)
export const getUniversityById = async (req, res) => {
  try {
    const university = await User.findOne({
      _id: req.params.id,
      role: "university",
      verificationStatus: "approved",
    }).select("name universityProfile");
    if (!university) return res.status(404).json({ message: "University not found" });

    const circulars = await Circular.find({
      university: university._id,
      isActive: true,
    }).select("programName degreeLevel department deadline");

    res.json({
      _id: university._id,
      name: university.name,
      universityProfile: university.universityProfile,
      activeCirculars: circulars,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/universities/:id/save (toggle - save or unsave)
// Student - bookmark a university
export const toggleSaveUniversity = async (req, res) => {
  try {
    const university = await User.findOne({ _id: req.params.id, role: "university" });
    if (!university) return res.status(404).json({ message: "University not found" });

    const student = await User.findById(req.user._id);
    const alreadySaved = student.savedUniversities.some(
      (id) => String(id) === String(university._id)
    );

    if (alreadySaved) {
      student.savedUniversities = student.savedUniversities.filter(
        (id) => String(id) !== String(university._id)
      );
    } else {
      student.savedUniversities.push(university._id);
    }

    await student.save();
    res.json({ saved: !alreadySaved, savedUniversities: student.savedUniversities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/university/dashboard
// Returns all circulars posted by the logged-in university, with applicant counts
export const getUniversityDashboard = async (req, res) => {
  try {
    const circulars = await Circular.find({ university: req.user._id });

    const dashboardData = await Promise.all(
      circulars.map(async (circular) => {
        const applicantCount = await Application.countDocuments({ circular: circular._id });
        return {
          _id: circular._id,
          programName: circular.programName,
          department: circular.department,
          deadline: circular.deadline,
          seatsAvailable: circular.seatsAvailable,
          isActive: circular.isActive,
          applicantCount,
        };
      })
    );

    res.status(200).json({
      totalCirculars: circulars.length,
      activeCirculars: circulars.filter((c) => c.isActive).length,
      circulars: dashboardData,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
