import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define supported file types and their rule files
const extensionMap = {
  ".js": "js.json",
  ".ts": "ts.json",
  ".jsx": "js.json",
  ".tsx": "ts.json",
  ".py": "py.json",
  ".java": "java.json",
  ".cpp": "cpp.json",
  ".c": "cpp.json",
  ".cs": "csharp.json",
  ".php": "php.json",
  ".html": "html.json",
  ".css": "css.json",
  ".go": "go.json",
  ".rb": "ruby.json"
};

// Get absolute path to rules directory
const rulesDir = path.join(__dirname, "..", "rules");

// Load and validate rules for a specific file type
const loadRules = (extension) => {
  try {
    const ruleFile = extensionMap[extension];
    if (!ruleFile) {
      console.log(`No rules defined for extension: ${extension}`);
      return null;
    }

    const rulePath = path.join(rulesDir, ruleFile);
    if (!fs.existsSync(rulePath)) {
      console.error(`Rules file not found: ${rulePath}`);
      return null;
    }

    const ruleContent = fs.readFileSync(rulePath, "utf-8");
    const rules = JSON.parse(ruleContent);

    if (!Array.isArray(rules)) {
      console.error(`Invalid rules format in ${ruleFile}`);
      return null;
    }

    return rules;
  } catch (error) {
    console.error(`Error loading rules for ${extension}:`, error);
    return null;
  }
};

// Apply rules to a single line of code
const scanLine = (line, rules) => {
  const issues = [];
  
  rules.forEach(rule => {
    try {
      const regex = new RegExp(rule.pattern, "g");
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        issues.push({
          pattern: rule.pattern,
          issue: rule.issue,
          suggestion: rule.suggestion,
          severity: rule.severity || "medium",
          matchedText: match[0]
        });
      }
    } catch (error) {
      console.error(`Error applying rule pattern ${rule.pattern}:`, error);
    }
  });
  
  return issues;
};

// Main scanning function
export const scanCode = (code, filename) => {
  try {
    // Validate inputs
    if (!code || typeof code !== 'string') {
      return {
        success: false,
        error: 'Invalid file content',
        issues: []
      };
    }

    if (!filename || typeof filename !== 'string') {
      return {
        success: false,
        error: 'Invalid filename',
        issues: []
      };
    }

    // Get file extension and load rules
    const ext = path.extname(filename).toLowerCase();
    const rules = loadRules(ext);

    if (!rules) {
      return {
        success: false,
        error: `No valid rules found for ${ext} files`,
        issues: []
      };
    }

    // Scan the code
    const lines = code.split('\n');
    const vulnerabilities = [];

    lines.forEach((line, index) => {
      const lineIssues = scanLine(line.trim(), rules);
      if (lineIssues.length > 0) {
        lineIssues.forEach(issue => {
          vulnerabilities.push({
            ...issue,
            line: index + 1,
            code: line.trim()
          });
        });
      }
    });

    return {
      success: true,
      error: null,
      issues: vulnerabilities,
      stats: {
        totalLines: lines.length,
        issuesFound: vulnerabilities.length,
        fileType: ext
      }
    };

  } catch (error) {
    console.error('Error in scanCode:', error);
    return {
      success: false,
      error: error.message,
      issues: []
    };
  }
};
