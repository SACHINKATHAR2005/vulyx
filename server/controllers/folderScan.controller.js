import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { scanCode } from "../utils/scanner.js";
import { calculateSecurityScore } from "../utils/score.js";
import { Report } from "../model/report.model.js";

// Helper: Recursively scan all supported code files
const scanAllFiles = async (dir, userId, reportList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await scanAllFiles(fullPath, userId, reportList);
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if ([".js", ".py", ".cpp", ".java"].includes(ext)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const issues = scanCode(content);
        const totalLines = content.split("\n").length;
        const score = calculateSecurityScore(totalLines, issues.length);

        if (issues.length > 0) {
          // Save each report to DB
          await Report.create({
            user: userId,
            filename: path.basename(fullPath),
            totalIssues: issues.length,
            score,
            vulnerabilities: issues
          });

          reportList.push({
            file: fullPath,
            score,
            issues
          });
        }
      }
    }
  }
  return reportList;
};

// Main controller
export const scanZippedProject = async (req, res) => {
  try {
    const zipPath = req.file.path;
    const extractPath = `temp/${Date.now()}`;

    // Unzip to a temp folder
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    // Scan extracted files
    const results = await scanAllFiles(extractPath, req.user.id);
    const totalIssues = results.reduce((acc, f) => acc + f.issues.length, 0);
    const totalFiles = results.length;

    return res.status(200).json({
      success: true,
      filesScanned: totalFiles,
      totalIssues,
      summary: `${totalIssues} issues in ${totalFiles} files`,
      results
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Folder scan failed",
      error: error.message
    });
  }
};
