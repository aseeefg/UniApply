import User from "../models/User.js";

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
