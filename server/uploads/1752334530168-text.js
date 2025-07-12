// This is a vulnerable JavaScript file for testing

const userInput = prompt("Enter something:");

// 🚨 Potential vulnerability: using eval
eval(userInput);

// 🚨 Another issue: hardcoded secret key
const secret = "my-secret-api-key-123";

// 🚨 Weak password check
if (password == "123456") {
  console.log("Weak password accepted!");
}

// ✅ Safe code
console.log("Hello, world!");
