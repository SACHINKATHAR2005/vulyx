import fs from "fs";
import path from "path";
import { scanCode } from "../scanner/utils/scanner.js";
import { calculateSecurityScore } from "../utils/score.js";
import { Report } from "../model/report.model.js";
import { cleanUpload } from "../script/cleanUpload.js";
import { supportedExtensions } from "../middlewares/upload.middleware.js";

export const scanMultipleFiles = async (req, res) => {
  try {
    // Validate request
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
        supportedTypes: supportedExtensions,
      });
    }

    const uploadedFiles = req.files;
    const results = [];
    const errors = [];

    // Calculate total credits required
    const totalCreditsRequired = uploadedFiles.length * 2;
    // Fetch user and check credits
    const userModel = require('../model/user.model.js');
    const user = await userModel.User.findById(req.user.id);
    if (!user || user.credits < totalCreditsRequired) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. You need ${totalCreditsRequired} credits, but have ${user ? user.credits : 0}.`
      });
    }
    // Deduct credits before scanning
    user.credits -= totalCreditsRequired;
    await user.save();

    // Process each file
    for (const file of uploadedFiles) {
      try {
        console.log(`Processing file: ${file.originalname}`);

        // Validate file extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!supportedExtensions.includes(ext)) {
          errors.push({
            filename: file.originalname,
            error: `Unsupported file type: ${ext}`,
          });
          continue;
        }

        // Read file content
        let content;
        try {
          content = fs.readFileSync(file.path, "utf-8");
          console.log(`Successfully read file: ${file.originalname}`);
        } catch (err) {
          console.error(`Error reading file ${file.originalname}:`, err);
          errors.push({
            filename: file.originalname,
            error: "Failed to read file content",
          });
          continue;
        }

        // Scan file
        console.log(`Scanning file: ${file.originalname}`);
        const scanResult = scanCode(content, file.originalname);

        if (!scanResult.success) {
          console.error(`Scan failed for ${file.originalname}:`, scanResult.error);
          errors.push({
            filename: file.originalname,
            error: scanResult.error,
          });
          continue;
        }

        const { issues, stats } = scanResult;
        const score = calculateSecurityScore(stats.totalLines, issues.length);

        // Save report to DB and get the document ID
        let savedReport;
        try {
          savedReport = await Report.create({
            user: req.user.id,
            filename: file.originalname,
            totalIssues: issues.length,
            score,
            vulnerabilities: issues,
          });
          console.log(`Saved report for ${file.originalname}`);
        } catch (err) {
          console.error(`Error saving report for ${file.originalname}:`, err);
          errors.push({
            filename: file.originalname,
            error: "Failed to save report",
          });
          continue;
        }

        // Add to results with document ID
        results.push({
          _id: savedReport._id,
          filename: file.originalname,
          extension: ext,
          size: file.size,
          issues: issues.length,
          score,
          vulnerabilities: issues,
          stats,
        });
      } catch (err) {
        console.error(`Error processing ${file.originalname}:`, err);
        errors.push({
          filename: file.originalname,
          error: err.message,
        });
      }
    }

    // Calculate totals
    const totalIssues = results.reduce((acc, file) => acc + file.issues, 0);
    const totalFiles = results.length;

    // Send response
    res.status(200).json({
      success: true,
      totalFiles,
      totalIssues,
      summary: `${totalIssues} issues found in ${totalFiles} files`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      supportedTypes: supportedExtensions,
    });

    // Clean up files
    console.log("Cleaning up uploaded files...");
    for (const file of uploadedFiles) {
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Failed to delete ${file.path}:`, err.message);
      });
    }
    cleanUpload();
  } catch (error) {
    console.error("Scan operation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Scan operation failed",
      error: error.message,
      supportedTypes: supportedExtensions,
    });
  }
};
