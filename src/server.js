const { createApp } = require("./app");
const fs = require("fs");
const path = require("path");

// Ensure uploads folder exists (fixes Render crash)
const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const port = Number(process.env.PORT || 3000);
const app = createApp();

// Health route (must be BEFORE listen)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(port, () => {
  console.log(`Invoice processing system is running on port ${port}`);
});