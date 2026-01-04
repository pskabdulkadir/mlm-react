const crypto = require("crypto");

const password = "admin123";
const hash = crypto.createHash("sha256").update(password).digest("hex");
console.log("Password:", password);
console.log("Hash:", hash);

// Test against database hash
const dbHash =
  "8553e2514df607ab2251298c0e29f408af59f39c2027d6978fe4ff9628f9574b";
console.log("DB Hash:", dbHash);
console.log("Match:", hash === dbHash);
