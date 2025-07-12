export function calculateSecurityScore(totalLines, issueCount) {
  const safeLines = totalLines - issueCount;
  const score = Math.max(0, (safeLines / totalLines) * 100);
  return Math.round(score);
}
