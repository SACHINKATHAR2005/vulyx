// /utils/ruleEngine.js
export const applyRulesToCode = (code, rules) => {
  const lines = code.split("\n");
  const issues = [];

  lines.forEach((line, index) => {
    rules.forEach(rule => {
      const regex = new RegExp(rule.pattern);
      if (regex.test(line)) {
        issues.push({
          line: index + 1,
          issue: rule.issue,
          suggestion: rule.suggestion,
          severity: rule.severity || "low"
        });
      }
    });
  });

  return issues;
};
