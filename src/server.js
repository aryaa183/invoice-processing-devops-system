const { createApp } = require("./app");
const fs = require("fs");
const path = require("path");

const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
const app = createApp();

app.listen(port, () => {
  console.log(`Invoice processing system is running on port ${port}`);
});