import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reportName: { type: String, required: true },
    reportType: { type: mongoose.Schema.Types.ObjectId, ref: "ReportType", required: true },
    year: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    currency: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reportData: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", ReportSchema);
