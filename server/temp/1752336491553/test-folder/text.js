// 🚨 Vulnerable JavaScript file for testing multiple issues

const userInput = prompt("Enter your input:");

// 🔴 1. Dangerous eval
eval(userInput);

// 🔴 2. Hardcoded API key
const apiKey = "secret=abc123token";

// 🔴 3. Weak password check
if (password == "123456") {
  console.log("Insecure login accepted.");
}

// 🔴 4. Insecure URL
fetch("http://example.com/api/data");

// 🔴 5. document.write (XSS)
document.write("Welcome " + userInput);

// 🔴 6. SQL query inside string
const query = "SELECT * FROM users WHERE email = '" + userEmail + "'";

// ✅ Safe line
console.log("Scan complete.");
