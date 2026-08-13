import { GoogleGenAI } from "@google/genai";
import User from "../models/User.js";
import Circular from "../models/Circular.js";
import Application from "../models/Application.js";

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
  const {
    curriculumType,
    sscResult,
    hscResult,
    oLevelResult,
    aLevelResult,
    phone,
    address,
    degreeLevel,
    subjectInterests,
    preferredLocation,
    profileImage,
  } = req.body;

  const student = await User.findById(req.user._id);
  student.studentProfile = {
    ...student.studentProfile,
    ...(curriculumType && { curriculumType }),
    ...(sscResult && { sscResult }),
    ...(hscResult && { hscResult }),
    ...(oLevelResult && { oLevelResult }),
    ...(aLevelResult && { aLevelResult }),
    ...(phone && { phone }),
    ...(address && { address }),
    ...(degreeLevel && { degreeLevel }),
    ...(Array.isArray(subjectInterests) && { subjectInterests }),
    ...(preferredLocation && { preferredLocation }),
    ...(profileImage && { profileImage }),
  };
  await student.save();

  res.json({ message: "Profile updated", studentProfile: student.studentProfile });
};

const includesCI = (a, b) => {
  if (!a || !b) return false;
  const x = a.toLowerCase().trim();
  const y = b.toLowerCase().trim();
  return x.includes(y) || y.includes(x);
};

const matchCircular = (studentProfile, circular) => {
  const matchedOn = [];

  if (includesCI(studentProfile.degreeLevel, circular.degreeLevel)) {
    matchedOn.push("degree level");
  }

  (studentProfile.subjectInterests || []).forEach((interest) => {
    if (includesCI(interest, circular.department) || includesCI(interest, circular.programName)) {
      matchedOn.push(`interest: ${interest}`);
    }
  });

  const universityLocation = circular.university?.universityProfile?.location;
  if (includesCI(studentProfile.preferredLocation, universityLocation)) {
    matchedOn.push("location");
  }

  return matchedOn;
};

// @route GET /api/student/recommendations
export const getRecommendations = async (req, res) => {
  const studentProfile = req.user.studentProfile || {};
  const hasPreferences =
    Boolean(studentProfile.degreeLevel) ||
    Boolean(studentProfile.preferredLocation) ||
    (studentProfile.subjectInterests && studentProfile.subjectInterests.length > 0);

  if (!hasPreferences) {
    return res.json({ circulars: [], needsProfile: true });
  }

  const appliedCirculars = await Application.find({ student: req.user._id }).distinct("circular");

  const circulars = await Circular.find({
    isActive: true,
    deadline: { $gte: new Date() },
    _id: { $nin: appliedCirculars },
  }).populate("university", "name universityProfile.universityName universityProfile.location");

  const recommendations = circulars
    .map((circular) => ({
      circular,
      matchedOn: matchCircular(studentProfile, circular),
    }))
    .filter((r) => r.matchedOn.length > 0)
    .sort((a, b) => b.matchedOn.length - a.matchedOn.length)
    .map((r) => ({ ...r.circular.toObject(), matchedOn: r.matchedOn }));

  res.json({ circulars: recommendations, needsProfile: false });
};

// @route GET /api/student/recommendations/:circularId/explain
export const explainRecommendation = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: "AI explanations are not configured on this server" });
  }

  const studentProfile = req.user.studentProfile || {};
  const circular = await Circular.findById(req.params.circularId).populate(
    "university",
    "name universityProfile.universityName universityProfile.location"
  );
  if (!circular) return res.status(404).json({ message: "Circular not found" });

  const matchedOn = matchCircular(studentProfile, circular);

  const prompt = `A student is browsing a university admission portal. Based on the details below,
write exactly 1-2 short, friendly sentences explaining why this program might be a good fit for them.

Student's stated preferences:
- Preferred degree level: ${studentProfile.degreeLevel || "not specified"}
- Subject interests: ${(studentProfile.subjectInterests || []).join(", ") || "not specified"}
- Preferred location: ${studentProfile.preferredLocation || "not specified"}

Program:
- Program name: ${circular.programName}
- Department: ${circular.department}
- Degree level: ${circular.degreeLevel || "not specified"}
- University: ${circular.university?.universityProfile?.universityName || circular.university?.name}
- Location: ${circular.university?.universityProfile?.location || "not specified"}

Rule-based match reasons already identified: ${matchedOn.join(", ") || "general relevance"}

Rules:
- Do not state or imply any admission probability, chance, or likelihood of acceptance.
- Do not claim the student will get in or is a strong/weak candidate.
- Only describe how the program's subject, degree level, or location lines up with what the student said they want.
- Output only the 1-2 sentences, no preamble, no markdown.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    res.json({ explanation: response.text.trim() });
  } catch (err) {
    res.status(500).json({ message: "Could not generate an explanation right now" });
  }
};
