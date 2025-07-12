import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  filename: String,
  totalIssues: Number,
  score: Number,
  vulnerabilities: [
    {
      line: Number,
      issue: String,
      suggestion: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Report = mongoose.model("Report", reportSchema);
