import mongoose from "mongoose";

const circularSchema = new mongoose.Schema(
  {
    university: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    programName: { type: String, required: true },
    department: { type: String, required: true },
    degreeLevel: { type: String },
    seatsAvailable: { type: Number, required: true },
    minRequirements: { type: String, required: true },
    applicationFee: { type: Number, required: true },
    deadline: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Circular", circularSchema);
