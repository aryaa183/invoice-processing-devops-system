# Concise Project Report

## Title

Invoice Processing & Auto-Entry System with CI/CD Pipeline

## Problem Statement

Many companies still enter invoice details manually into spreadsheets or internal systems. This consumes staff time and introduces human errors in vendor names, invoice numbers, dates, and totals.

## Proposed Solution

The application accepts invoice uploads, extracts fields from the invoice using OCR or structured text parsing, and stores the extracted record in a database. The project is supported by a DevOps pipeline that validates every code change before deployment.

## Objectives

- automate invoice data extraction
- reduce manual data-entry effort
- maintain a structured Git-based project workflow
- integrate testing and linting into CI
- package the application with Docker
- support automated deployment to a staging environment

## DevOps Implementation

### Version Control

Git is used as the version control system with a recommended branch-based workflow. The repository is organized into clear folders for backend, frontend, tests, scripts, docs, and CI/CD configuration.

### Automated Build

`npm` is used to automate the build lifecycle. The `npm run ci` command executes linting, tests, and build reporting in a single step.

### Continuous Integration

GitHub Actions is configured to run on pushes and pull requests. The pipeline installs dependencies, runs ESLint, executes automated tests, and uploads the build report as an artifact.

### Static Code Analysis

ESLint checks JavaScript files for maintainability and common code-quality issues before deployment.

### Containerization

The project includes a Dockerfile for packaging the application and a `docker-compose.yml` file for local staging simulation.

### Continuous Delivery / Deployment

The deploy stage builds the Docker image and can trigger a staging deployment using a Render deploy hook stored in GitHub Secrets.

## Testing Summary

- parser unit tests verify invoice field extraction
- API integration tests verify health and invoice ingestion endpoints
- linting verifies code-quality standards

## Outcome

The final project demonstrates a complete DevOps pipeline around a practical invoice-processing application. It aligns with the rubric requirements for problem definition, version control, automated build, CI testing, static analysis, Docker-based packaging, and deployment readiness.

