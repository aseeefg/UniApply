import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Shortlisted", "Accepted", "Rejected"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    circular: { type: mongoose.Schema.Types.ObjectId, ref: "Circular", required: true },
    documents: [
      {
        name: String,
        url: String,
        type: String, // transcript, certificate, nationalId, photo
      },
    ],
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Shortlisted", "Accepted", "Rejected"],
      default: "Submitted",
    },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
