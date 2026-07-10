import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    sscResult: { type: String },
    hscResult: { type: String },
    gpa: { type: Number },
    phone: { type: String },
    address: { type: String },
  },
  { _id: false }
);

const universityProfileSchema = new mongoose.Schema(
  {
    universityName: { type: String },
    location: { type: String },
    website: { type: String },
    description: { type: String },
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
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
