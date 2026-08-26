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
  const { universityName, location, website, description, contactInfo } = req.body;

  const university = await User.findById(req.user._id);
  university.universityProfile = {
    ...university.universityProfile,
    ...(universityName && { universityName }),
    ...(location && { location }),
    ...(website && { website }),
    ...(description && { description }),
    ...(contactInfo && { contactInfo }),
  };
  await university.save();
  
  res.json({ message: "Profile updated", universityProfile: university.universityProfile });
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
