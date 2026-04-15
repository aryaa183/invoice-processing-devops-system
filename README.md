# Invoice Processing & Auto-Entry System

This project is a DevOps mini-project that automates invoice data entry. Users upload an invoice image or plain text invoice, the application extracts structured billing fields, and the data is stored in SQLite for later viewing.

## 1. Problem Definition

Companies often enter invoice information manually into accounting systems. This creates delays, data-entry mistakes, and inconsistent records. The goal of this project is to reduce manual work by building a simple invoice-processing pipeline that:

- accepts invoice uploads
- extracts invoice metadata automatically
- stores structured data in a database
- validates code quality through CI/CD
- packages the system for containerized deployment

## 2. Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express
- OCR: Tesseract.js
- Database: SQLite via `node:sqlite`
- Testing: Node test runner + Supertest
- Static analysis: ESLint
- Containerization: Docker, Docker Compose
- CI/CD: GitHub Actions

## 3. Project Structure

```text
.
|-- .github/workflows/ci-cd.yml
|-- public/
|-- src/
|-- tests/
|-- scripts/
|-- docs/
|-- artifacts/
|-- Dockerfile
|-- docker-compose.yml
|-- package.json
```

## 4. Structured Version Control

Recommended Git workflow for submission:

- `main`: stable branch
- `feature/invoice-parser`: parser logic
- `feature/api-storage`: API and database
- `feature/frontend-dashboard`: UI work
- `feature/devops-pipeline`: CI/CD and Docker

Suggested commit examples:

- `feat: add invoice field extraction service`
- `test: cover invoice upload endpoint`
- `ci: add GitHub Actions quality pipeline`
- `docs: add deployment and report documents`

## 5. Automated Build Tool

`npm` is used as the build tool and task runner.

- `npm install` installs dependencies
- `npm run lint` performs static analysis
- `npm test` runs automated tests
- `npm run build` generates a build report in `artifacts/build-report.md`
- `npm run ci` runs lint, tests, and build together

## 6. Local Setup

```bash
npm install
npm run ci
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## 7. Docker Setup

Build and run locally:

```bash
docker build -t invoice-processing-system .
docker run -p 3000:3000 invoice-processing-system
```

Or use staging compose:

```bash
docker compose up --build
```

Then open [http://localhost:8080](http://localhost:8080).

## 8. CI/CD Pipeline

The GitHub Actions workflow at [`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml) performs:

- dependency installation with `npm ci`
- ESLint static analysis
- automated API and parser tests
- build report generation
- Docker image build for staging
- optional staging deployment through a Render deploy hook secret

## 9. Deployment

Recommended staging target: Render Web Service using the provided `Dockerfile`.

Required secret for automated deploy:

- `RENDER_DEPLOY_HOOK_URL`

If the secret is configured, every push to `main` triggers the deploy stage after the quality checks pass.

## 10. Submission Files

- CI/CD config: [`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml)
- Build report: [`artifacts/build-report.md`](./artifacts/build-report.md)
- Test report: [`artifacts/test-report.txt`](./artifacts/test-report.txt)
- Lint report: [`artifacts/lint-report.txt`](./artifacts/lint-report.txt)
- Project report: [`docs/project-report.md`](./docs/project-report.md)
- Deployment evidence: [`docs/deployment-evidence.md`](./docs/deployment-evidence.md)

## 11. Repository Link

Add your GitHub repository URL here after pushing:

`REPLACE_WITH_YOUR_GITHUB_REPOSITORY_LINK`

