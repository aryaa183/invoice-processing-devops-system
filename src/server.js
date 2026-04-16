const { createApp } = require("./app");
const fs = require("fs");
const path = require("path");

const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const port = Number(process.env.PORT || 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`Invoice processing system is running on port ${port}`);
});