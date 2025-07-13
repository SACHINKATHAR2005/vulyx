const userInput = "admin' --";
const query = "SELECT * FROM users WHERE name = '" + userInput + "'"; // SQL Injection

eval("console.log('Injected code')"); // Code Injection

document.write(userInput); // XSS

const apiKey = "ABC123SECRETKEY"; // Hardcoded secret
