import User from "../models/User.js";

// @route GET /api/student/profile
export const getMyStudentProfile = async (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email,
    studentProfile: req.user.studentProfile,
  });
};

// @route PATCH /api/student/profile
export const updateMyStudentProfile = async (req, res) => {
  const { sscResult, hscResult, gpa, phone, address } = req.body;

  const student = await User.findById(req.user._id);
  student.studentProfile = {
    ...student.studentProfile,
    ...(sscResult && { sscResult }),
    ...(hscResult && { hscResult }),
    ...(gpa !== undefined && { gpa }),
    ...(phone && { phone }),
    ...(address && { address }),
  };
  await student.save();

  res.json({ message: "Profile updated", studentProfile: student.studentProfile });
};
