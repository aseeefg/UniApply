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
    willingToRelocate,
    nctbGroup,
    institutionTypePreference,
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
    ...(typeof willingToRelocate === "boolean" && { willingToRelocate }),
    ...(nctbGroup && { nctbGroup }),
    ...(institutionTypePreference && { institutionTypePreference }),
    ...(profileImage && { profileImage }),
  };
  await student.save();

  res.json({ message: "Profile updated", studentProfile: student.studentProfile });
};

// @route POST /api/student/profile/transcript
// Student uploads their transcript/marksheet, stored on their profile (not tied to one application)
export const uploadTranscript = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const student = await User.findById(req.user._id);
  student.studentProfile = {
    ...student.studentProfile,
    transcriptUrl: req.file.path,
    transcriptName: req.file.originalname,
  };
  await student.save();

  res.json({ message: "Transcript uploaded", studentProfile: student.studentProfile });
};

const includesCI = (a, b) => {
  if (!a || !b) return false;
  const x = a.toLowerCase().trim();
  const y = b.toLowerCase().trim();
  return x.includes(y) || y.includes(x);
};

// ─── Weighted recommendation scoring ─────────────────────────────────────────
// Priority order requested: program/subject fit first, location second.
// A student who said they won't relocate never sees a non-local result at
// all (hard filter) rather than just ranked lower - recommending a program
// they've already ruled out isn't useful.
const SCORE_INTEREST = 3;
const SCORE_DEGREE_LEVEL = 2;
const SCORE_LOCATION = 1;
const SCORE_INSTITUTION_TYPE = 2;
const RECOMMENDATION_LIMIT = 5;

// Returns { score, matchedOn } or null if the student has hard-excluded this
// circular (wrong location with willingToRelocate: false, or - when the
// student named subject interests at all - no overlap with any of them).
// The interest hard-filter matters: without it, a circular could still pass
// purely on degree-level/location score even with zero subject overlap (e.g.
// a Languages & Communication major would still see Engineering circulars
// just because both are "Undergraduate"), which silently broke the "program
// fit first" priority this function is supposed to enforce.
const scoreCircular = (studentProfile, circular, universityLocation, universityType) => {
  const matchedOn = [];
  let score = 0;

  const interests = studentProfile.subjectInterests || [];
  const matchedInterests = interests.filter(
    (interest) => includesCI(interest, circular.department) || includesCI(interest, circular.programName)
  );
  if (interests.length > 0 && matchedInterests.length === 0) {
    return null;
  }
  matchedInterests.forEach((interest) => {
    matchedOn.push(`interest: ${interest}`);
    score += SCORE_INTEREST;
  });

  if (includesCI(studentProfile.degreeLevel, circular.degreeLevel)) {
    matchedOn.push("degree level");
    score += SCORE_DEGREE_LEVEL;
  }

  const locationMatches = includesCI(studentProfile.preferredLocation, universityLocation);

  if (
    studentProfile.preferredLocation &&
    studentProfile.willingToRelocate === false &&
    !locationMatches
  ) {
    return null;
  }

  if (locationMatches) {
    matchedOn.push("location");
    score += SCORE_LOCATION;
  }

  if (
    studentProfile.institutionTypePreference &&
    studentProfile.institutionTypePreference !== "No preference" &&
    includesCI(studentProfile.institutionTypePreference, universityType)
  ) {
    matchedOn.push(`${universityType?.toLowerCase()} university`);
    score += SCORE_INSTITUTION_TYPE;
  }

  return { score, matchedOn };
};

const hasStatedPreferences = (studentProfile) =>
  Boolean(studentProfile.degreeLevel) ||
  Boolean(studentProfile.preferredLocation) ||
  (studentProfile.subjectInterests && studentProfile.subjectInterests.length > 0);

// @route GET /api/student/recommendations
// Top 5 recommended circulars, ranked program-fit first, location second.
export const getRecommendations = async (req, res) => {
  const studentProfile = req.user.studentProfile || {};

  if (!hasStatedPreferences(studentProfile)) {
    return res.json({ circulars: [], needsProfile: true });
  }

  const appliedCirculars = await Application.find({ student: req.user._id }).distinct("circular");

  const circulars = await Circular.find({
    isActive: true,
    deadline: { $gte: new Date() },
    _id: { $nin: appliedCirculars },
  }).populate(
    "university",
    "name universityProfile.universityName universityProfile.location universityProfile.institutionType universityProfile.logo"
  );

  const recommendations = circulars
    .map((circular) => ({
      circular,
      result: scoreCircular(
        studentProfile,
        circular,
        circular.university?.universityProfile?.location,
        circular.university?.universityProfile?.institutionType
      ),
    }))
    .filter((r) => r.result && r.result.score > 0)
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, RECOMMENDATION_LIMIT)
    .map((r) => ({ ...r.circular.toObject(), matchedOn: r.result.matchedOn }));

  res.json({ circulars: recommendations, needsProfile: false });
};

// @route GET /api/student/recommendations/universities
// Top 5 recommended universities - each represented by its best-matching
// active circular, same scoring/priority/relocation rules as above. Feeds
// the "Recommended for you" panel on the Browse Universities page.
export const getRecommendedUniversities = async (req, res) => {
  try {
    const studentProfile = req.user.studentProfile || {};

    if (!hasStatedPreferences(studentProfile)) {
      return res.json({ universities: [], needsProfile: true });
    }

    const universities = await User.find({
      role: "university",
      verificationStatus: "approved",
    }).select("name universityProfile");

    const scored = await Promise.all(
      universities.map(async (uni) => {
        const circulars = await Circular.find({
          university: uni._id,
          isActive: true,
          deadline: { $gte: new Date() },
        });

        let best = null;
        for (const circular of circulars) {
          const result = scoreCircular(
            studentProfile,
            circular,
            uni.universityProfile?.location,
            uni.universityProfile?.institutionType
          );
          if (result && (!best || result.score > best.score)) best = result;
        }
        if (!best || best.score === 0) return null;

        return {
          _id: uni._id,
          name: uni.name,
          universityProfile: uni.universityProfile,
          activeCircularCount: circulars.length,
          matchedOn: best.matchedOn,
          score: best.score,
        };
      })
    );

    const top = scored
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, RECOMMENDATION_LIMIT);

    res.json({ universities: top, needsProfile: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Student Eligibility Checker ─────────────────────────────────────────────

const parseGPA = (resultText) => {
  if (!resultText) return null;
  const match = resultText.match(/\d+(\.\d+)?/);
  if (!match) return null;
  const value = parseFloat(match[0]);
  return Number.isFinite(value) ? value : null;
};

// @route GET /api/student/eligibility/:circularId
// Compares the student's stated HSC GPA against a circular's minimum GPA.
// Deliberately returns eligible: null (never a guess) whenever the comparison
// can't be made honestly - see uniapply-checklist.md for why this project
// rejected an "admission chance %" predictor.
export const checkEligibility = async (req, res) => {
  try {
    const circular = await Circular.findById(req.params.circularId);
    if (!circular) return res.status(404).json({ message: "Circular not found" });

    if (circular.minGPA === undefined || circular.minGPA === null) {
      return res.json({
        eligible: null,
        message: "This university hasn't set a numeric GPA requirement - read the minimum requirements text instead.",
      });
    }

    const studentProfile = req.user.studentProfile || {};

    if (studentProfile.curriculumType === "British") {
      return res.json({
        eligible: null,
        message: "GPA comparison isn't available for the British curriculum - check the university's stated requirements.",
      });
    }

    const studentGPA = parseGPA(studentProfile.hscResult);
    if (studentGPA === null) {
      return res.json({
        eligible: null,
        message: "Add your HSC GPA to your profile to check eligibility.",
      });
    }

    res.json({
      eligible: studentGPA >= circular.minGPA,
      studentGPA,
      requiredGPA: circular.minGPA,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── OpenRouter-backed AI features ───────────────────────────────────────────
// Free-tier only: minimax/minimax-m3:free costs $0 for input and
// output tokens on OpenRouter - the `:free` suffix is what marks a model as
// free; using a non-`:free` model id here would incur real charges.

const OPENROUTER_MODEL = "minimax/minimax-m3:free";

const AI_NOT_CONFIGURED_MESSAGE =
  "AI features aren't set up yet - add a real OPENROUTER_API_KEY to server/.env (free models available at openrouter.ai).";

const isOpenRouterConfigured = () => Boolean(process.env.OPENROUTER_API_KEY);

// Calls OpenRouter's OpenAI-compatible chat completions endpoint and returns
// the generated text. Throws with `rateLimited: true` on a 429.
const callOpenRouter = async (prompt) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (response.status === 429) {
    const err = new Error("Rate limited");
    err.rateLimited = true;
    throw err;
  }
  if (!response.ok) {
    throw new Error(`OpenRouter error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenRouter");
  return text.trim();
};

// @route GET /api/student/recommendations/:circularId/explain
export const explainRecommendation = async (req, res) => {
  if (!isOpenRouterConfigured()) {
    return res.status(503).json({ message: AI_NOT_CONFIGURED_MESSAGE });
  }

  const studentProfile = req.user.studentProfile || {};
  const circular = await Circular.findById(req.params.circularId).populate(
    "university",
    "name universityProfile.universityName universityProfile.location universityProfile.institutionType"
  );
  if (!circular) return res.status(404).json({ message: "Circular not found" });

  const matchedOn = scoreCircular(
    studentProfile,
    circular,
    circular.university?.universityProfile?.location,
    circular.university?.universityProfile?.institutionType
  )?.matchedOn || [];

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
    const explanation = await callOpenRouter(prompt);
    res.json({ explanation });
  } catch (err) {
    if (err.rateLimited) {
      return res.status(429).json({ message: "AI explanations are rate-limited right now (free tier) - try again in a minute." });
    }
    res.status(500).json({ message: "Could not generate an explanation right now" });
  }
};

// @route POST /api/student/quiz
// Rule-based question set on the frontend; this scores the answers into 5
// suggested undergraduate program/major categories via OpenRouter. Distinct
// from getRecommendations - this suggests fields of study in general, not
// specific open circulars.
export const generateProgramSuggestions = async (req, res) => {
  if (!isOpenRouterConfigured()) {
    return res.status(503).json({ message: AI_NOT_CONFIGURED_MESSAGE });
  }

  const { answers } = req.body;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return res.status(400).json({ message: "Missing quiz answers" });
  }

  const answerLines = Object.entries(answers)
    .map(([question, answer]) => `- ${question}: ${Array.isArray(answer) ? answer.join(", ") : answer}`)
    .join("\n");

  const prompt = `A student is taking a short quiz to figure out which undergraduate program or major to pursue.

Their answers:
${answerLines}

Based on these answers, suggest the top 5 undergraduate program/major categories (e.g. "Computer Science", "Business Administration", "Mechanical Engineering") this student should consider trying for.

Rules:
- Do not state or imply any admission probability, chance, or likelihood of acceptance at any specific institution.
- Base suggestions only on stated interests and work style, not perceived academic strength.
- Respond with ONLY valid JSON, no markdown formatting, no preamble, in exactly this shape:
[{"program": "Program Name", "reason": "One short sentence explaining the fit."}]`;

  try {
    const raw = await callOpenRouter(prompt);
    const text = raw.replace(/^```(json)?\s*|\s*```$/g, "");
    let suggestions;
    try {
      suggestions = JSON.parse(text);
    } catch {
      return res.status(500).json({ message: "Could not parse AI suggestions - try again" });
    }

    res.json({ suggestions });
  } catch (err) {
    if (err.rateLimited) {
      return res.status(429).json({ message: "The program quiz is rate-limited right now (free tier) - try again in a minute." });
    }
    res.status(500).json({ message: "Could not generate suggestions right now" });
  }
};
