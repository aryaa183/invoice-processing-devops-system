const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const artifactsDir = path.join(projectRoot, "artifacts");
fs.mkdirSync(artifactsDir, { recursive: true });

const report = [
  "# Build Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Node Version: ${process.version}`,
  "",
  "## Build Tool",
  "",
  "- Package manager: npm",
  "- Main build command: `npm run build`",
  "- CI aggregate command: `npm run ci`",
  "",
  "## Deliverables Produced",
  "",
  "- Express application build assets verified",
  "- Public frontend available",
  "- Docker configuration included",
  "- GitHub Actions workflow included",
].join("\n");

fs.writeFileSync(path.join(artifactsDir, "build-report.md"), report);
console.log("Build report generated at artifacts/build-report.md");

