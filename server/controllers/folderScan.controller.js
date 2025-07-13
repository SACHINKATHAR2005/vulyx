import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { scanCodeWithRules } from "../scanner/utils/universalScanner.js";
import { calculateSecurityScore } from "../utils/score.js";
import { Report } from "../model/report.model.js";
import { cleanUpload } from "../script/cleanUpload.js";
import { cleanTemp } from "../script/cleanTemp.js";
import multer from "multer";

// Helper to delete folder recursively
const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
};

import { supportedExtensions } from "../middlewares/upload.middleware.js";
// Helper: Recursively scan all supported code files
const scanAllFiles = async (dir, userId, reportList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await scanAllFiles(fullPath, userId, reportList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (!supportedExtensions.includes(ext)) {
        console.log(`[SCAN] Skipping unsupported file: ${file} (ext: ${ext})`);
        continue;
      }
      try {
        console.log(`[SCAN] Scanning file: ${file} (ext: ${ext})`);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const scanResult = scanCodeWithRules(content, file);
        console.log(`[SCAN] scanResult for ${file}:`, scanResult);
        const issues = scanResult.issues || [];
        const totalLines = content.split("\n").length;
        const score = calculateSecurityScore(totalLines, issues.length);

        // Save report to DB and get the document ID
        const savedReport = await Report.create({
          user: userId,
          filename: file,
          totalIssues: issues.length,
          score,
          vulnerabilities: issues,
        });

        reportList.push({
          _id: savedReport._id,
          filename: file,
          size: stat.size,
          issues: issues.length,
          score,
          vulnerabilities: issues
        });
      } catch (error) {
        console.error(`[SCAN] Error scanning file ${file}:`, error);
      }
    }
  }
  return reportList;
};

// Main controller
export const scanZippedProject = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No ZIP file uploaded"
    });
  }

  const tempDir = path.join(process.cwd(), 'temp', Date.now().toString());
  
  try {
    // Create temp directory if it doesn't exist
    fs.mkdirSync(tempDir, { recursive: true });

    // Extract ZIP file
    await fs.createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: tempDir }))
      .promise();

    // Scan all files in the extracted directory
    const results = await scanAllFiles(tempDir, req.user.id);

    // Calculate credits required
    const totalCreditsRequired = results.length * 2;
    // Fetch user and check credits
    const userModel = require('../model/user.model.js');
    const user = await userModel.User.findById(req.user.id);
    if (!user || user.credits < totalCreditsRequired) {
      // Clean up
      deleteFolderRecursive(tempDir);
      fs.unlinkSync(req.file.path);
      cleanTemp();
      cleanUpload();
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. You need ${totalCreditsRequired} credits, but have ${user ? user.credits : 0}.`
      });
    }
    // Deduct credits
    user.credits -= totalCreditsRequired;
    await user.save();

    const totalIssues = results.reduce((acc, file) => acc + file.issues, 0);

    // Send response
    res.status(200).json({
      success: true,
      totalFiles: results.length,
      totalIssues,
      summary: `${totalIssues} issues in ${results.length} files`,
      results
    });

    // Clean up
    deleteFolderRecursive(tempDir);
    fs.unlinkSync(req.file.path);
    cleanTemp();
    cleanUpload();

  } catch (error) {
    console.error("ZIP scan failed:", error);
    // Clean up on error
    if (fs.existsSync(tempDir)) {
      deleteFolderRecursive(tempDir);
    }
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({
      success: false,
      message: "Failed to scan ZIP file",
      error: error.message
    });
  }
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Add your file filtering logic here
  cb(null, true);
};

const zipFileFilter = (req, file, cb) => {
  // Add your ZIP file filtering logic here
  cb(null, true);
};

const uploadFiles = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 1000
  }
});

const uploadZip = multer({
  storage: storage,
  fileFilter: zipFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1
  }
});
