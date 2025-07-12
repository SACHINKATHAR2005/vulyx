// Vulnerable JavaScript
const input = prompt("Enter something:");
eval(input); // ❌ Code injection
document.write("Hello " + input); // ❌ XSS risk
const password = "123456"; // ❌ Weak password
const token = "secret=abcd1234"; // ❌ Hardcoded secret
