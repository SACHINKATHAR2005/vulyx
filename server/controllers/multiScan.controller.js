import fs from "fs";
import { scanCode } from "../utils/scanner.js";
import { calculateSecurityScore } from "../utils/score.js";
import { Report } from "../model/report.model.js";
import { cleanUpload } from "../script/cleanUpload.js";

export const scanMultipleFiles = async (req, res) => {
  try {
    const uploadedFiles = req.files;
    const results = [];

    for (const file of uploadedFiles) {
      const content = fs.readFileSync(file.path, "utf-8");
      const issues = scanCode(content);
      const totalLines = content.split("\n").length;
      const score = calculateSecurityScore(totalLines, issues.length);

      // Save report to DB
      await Report.create({
        user: req.user.id,
        filename: file.originalname,
        totalIssues: issues.length,
        score,
        vulnerabilities: issues,
      });

      results.push({
        filename: file.originalname,
        size: file.size,
        issues: issues.length,
        score,
        vulnerabilities: issues,
      });
    }

    const totalIssues = results.reduce((acc, file) => acc + file.issues, 0);

    // ✅ Send response first
    res.status(200).json({
      success: true,
      totalFiles: results.length,
      totalIssues,
      summary: `${totalIssues} issues in ${results.length} files`,
      results,
    });

    // 🧹 Then delete uploaded files
    for (const file of uploadedFiles) {
      fs.unlink(file.path, (err) => {
        if (err) console.error(`❌ Failed to delete ${file.path}:`, err.message);
      });
    }
    cleanUpload();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Scan failed",
      error: error.message,
    });
  }
};
