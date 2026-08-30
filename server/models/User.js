import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    curriculumType: { type: String, enum: ["NCTB", "British"] },
    sscResult: { type: String },
    hscResult: { type: String },
    oLevelResult: { type: String },
    aLevelResult: { type: String },
    phone: { type: String },
    address: { type: String },
    degreeLevel: { type: String },
    subjectInterests: { type: [String], default: [] },
    preferredLocation: { type: String },
    // Whether the student would consider universities outside preferredLocation
    willingToRelocate: { type: Boolean, default: true },
    // Only meaningful when curriculumType === "NCTB" - the official SSC/HSC group
    nctbGroup: { type: String, enum: ["Science", "Business", "Arts"] },
    institutionTypePreference: {
      type: String,
      enum: ["Public", "Private", "No preference"],
      default: "No preference",
    },
    profileImage: { type: String },
    transcriptUrl: { type: String },
    transcriptName: { type: String },
  },
  { _id: false }
);

const universityProfileSchema = new mongoose.Schema(
  {
    universityName: { type: String },
    location: { type: String },
    // Powers the student's public/private preference match in recommendations
    institutionType: { type: String, enum: ["Public", "Private"] },
    // Logo/picture shown on the university's profile and on all of its circulars
    logo: { type: String },
    website: { type: String },
    description: { type: String },
    researchAreas: { type: String },
    contactInfo: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "university", "admin"],
      required: true,
    },
    // Only relevant when role === "university"
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.role === "university" ? "pending" : undefined;
      },
    },
    rejectionReason: { type: String },
    isActive: { type: Boolean, default: true },
    studentProfile: studentProfileSchema,
    universityProfile: universityProfileSchema,
    // Only relevant when role === "student" - universities bookmarked for comparison/tracking
    savedUniversities: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
