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
        // Wrapped as { type: String } rather than bare `type: String` -
        // Mongoose treats a bare `type` key as the schema-type declaration
        // for the whole subdocument, not a field named "type", which was
        // silently collapsing this into an array of strings instead of an
        // array of { name, url, type } objects.
        type: { type: String }, // transcript, certificate, nationalId, photo
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
