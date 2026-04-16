const { createApp } = require("./app");
const fs = require("fs");
const path = require("path");

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Create app FIRST
const app = createApp();

// Use correct PORT
const PORT = process.env.PORT || 3000;

// Start server ONCE
app.listen(PORT, () => {
  console.log(`Invoice processing system is running on port ${PORT}`);
});