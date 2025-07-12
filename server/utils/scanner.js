export function scanCode(content) {
  const lines = content.split("\n");
  const issues = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (line.includes("eval(")) {
      issues.push({
        line: lineNumber,
        issue: "`eval()` is dangerous and can lead to code injection",
        suggestion: "Avoid using `eval()`. Consider using `JSON.parse()` if needed."
      });
    }

    if (line.includes("document.write")) {
      issues.push({
        line: lineNumber,
        issue: "`document.write` is unsafe and can open XSS attacks",
        suggestion: "Avoid using `document.write`. Use DOM manipulation with `textContent` instead."
      });
    }

    if (line.includes("123456") || /password\s*=\s*["']123456["']/.test(line)) {
      issues.push({
        line: lineNumber,
        issue: "Weak password check found (hardcoded)",
        suggestion: "Use secure password hashing and validation instead of hardcoded values."
      });
    }

    if (line.includes("http://")) {
      issues.push({
        line: lineNumber,
        issue: "Insecure URL (http) found — consider using HTTPS",
        suggestion: "Always prefer `https://` over `http://` for secure communication."
      });
    }

    if (/SELECT .* FROM .* WHERE .*["']/.test(line)) {
      issues.push({
        line: lineNumber,
        issue: "Raw SQL detected — check for injection vulnerability",
        suggestion: "Use parameterized queries or ORM instead of raw SQL strings."
      });
    }
  });

  return issues;
}
