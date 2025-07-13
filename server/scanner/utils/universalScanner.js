import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mapping of extensions to rule files
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

// Full path to /rules directory
const rulesDir = path.join(__dirname, "..", "rules");

export const scanCodeWithRules = (code, filename) => {
  try {
    // Input validation
    if (!code || typeof code !== 'string') {
      console.error(`Invalid code input for file ${filename}:`, typeof code);
      return {
        error: true,
        message: 'Invalid file content',
        issues: []
      };
    }

    // Get file extension and validate
    const ext = path.extname(filename).toLowerCase();
    const ruleFile = extensionMap[ext];
    if (!ruleFile) {
      return {
        error: false,
        message: `No rules defined for extension: ${ext}`,
        issues: []
      };
    }

    // Load and validate rules
    const rulePath = path.join(rulesDir, ruleFile);
    if (!fs.existsSync(rulePath)) {
      console.error(`Rules file not found: ${rulePath}`);
      return {
        error: true,
        message: `Rules file not found for ${ext}`,
        issues: []
      };
    }

    // Parse rules
    const rules = JSON.parse(fs.readFileSync(rulePath, "utf-8"));
    if (!Array.isArray(rules)) {
      console.error(`Invalid rules format in ${ruleFile}`);
      return {
        error: true,
        message: 'Invalid rules format',
        issues: []
      };
    }

    // Scan for vulnerabilities
    const vulnerabilities = [];
    const lines = code.split('\n');

    rules.forEach(rule => {
      try {
        const regex = new RegExp(rule.pattern, "gi");
        
        lines.forEach((line, lineNum) => {
          let match;
          while ((match = regex.exec(line)) !== null) {
            vulnerabilities.push({
              line: lineNum + 1,
              pattern: rule.pattern,
              issue: rule.issue,
              suggestion: rule.suggestion,
              code: line.trim()
            });
          }
        });
      } catch (e) {
        console.error(`Error processing rule pattern: ${rule.pattern}`, e);
      }
    });

    return {
      error: false,
      message: 'Scan completed successfully',
      issues: vulnerabilities
    };
  } catch (error) {
    console.error('Error in scanCodeWithRules:', error);
    return {
      error: true,
      message: error.message,
      issues: []
    };
  }
};
