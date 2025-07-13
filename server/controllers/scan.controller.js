import fs from "fs";
import { scanCode } from "../utils/scanner.js";
import { calculateSecurityScore } from "../utils/score.js";
import { Report } from "../models/report.model.js";

export const scanUploadedFile = async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // 🔍 Scan for vulnerabilities
    const vulnerabilities = scanCode(fileContent);

    // 📊 Calculate security score
    const totalLines = fileContent.split("\n").length;
    const score = calculateSecurityScore(totalLines, vulnerabilities.length);

    // 💾 Save scan report to MongoDB
    await Report.create({
      user: req.user.id, // 👈 ensure you're using verifyToken middleware
      filename: req.file.originalname,
      totalIssues: vulnerabilities.length,
      score,
      vulnerabilities
    });

    // ✅ Respond to client
    res.status(200).json({
      success: true,
      filename: req.file.originalname,
      size: req.file.size,
      issues: vulnerabilities.length,
      score,
      vulnerabilities
    });

    // 🧹 Delete uploaded file after sending response
    fs.unlink(filePath, (err) => {
      if (err) console.error("❌ Failed to delete uploaded file:", err.message);
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Scan failed",
      error: error.message
    });
  }
};
