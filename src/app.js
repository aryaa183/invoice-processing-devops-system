const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const multer = require("multer");
const { createDatabase, createInvoiceRepository } = require("./db");
const { extractInvoiceFields } = require("./services/invoiceParser");
const { processUploadedInvoice } = require("./services/ocrService");

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function createApp(options = {}) {
  const app = express();
  const dataDirectory = path.resolve(options.dataDirectory || process.env.DATA_DIR || "./data");
  const uploadDirectory = path.resolve(options.uploadDirectory || process.env.UPLOAD_DIR || "./uploads");

  ensureDirectory(dataDirectory);
  ensureDirectory(uploadDirectory);

  const database = options.database || createDatabase(path.join(dataDirectory, "invoices.db"));
  const repository = options.repository || createInvoiceRepository(database);

  const upload = multer({
    dest: uploadDirectory,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });

  app.use(express.json({ limit: "1mb" }));

  // ✅ HEALTH
  app.get("/api/health", async (_request, response) => {
    try {
      const invoices = await repository.list();
      response.json({
        status: "ok",
        service: "invoice-processing-system",
        storedInvoices: invoices.length,
      });
    } catch (error) {
      response.status(500).json({ status: "error", message: error.message });
    }
  });

  // ✅ GET ALL INVOICES
  app.get("/api/invoices", async (_request, response, next) => {
    try {
      const invoices = await repository.list();
      response.json({ invoices });
    } catch (error) {
      next(error);
    }
  });

  // ✅ TEXT INPUT
  app.post("/api/invoices/text", async (request, response, next) => {
    try {
      const invoice = extractInvoiceFields(request.body.text || "", {
        sourceType: "manual-text",
        sourceName: request.body.sourceName || "dashboard-input",
      });
      const savedInvoice = await repository.insert(invoice);
      response.status(201).json({ invoice: savedInvoice });
    } catch (error) {
      next(error);
    }
  });

  // ✅ FILE UPLOAD
  app.post("/api/invoices/upload", upload.single("invoice"), async (request, response, next) => {
    try {
      const invoice = await processUploadedInvoice(request.file);
      const savedInvoice = await repository.insert(invoice);
      response.status(201).json({ invoice: savedInvoice });
    } catch (error) {
      next(error);
    }
  });

  // ✅ ERROR HANDLER — must have exactly 4 params
  app.use((error, _request, response, _next) => {
    response.status(400).json({
      error: error.message || "Invoice processing failed.",
    });
  });

  return app;
}

module.exports = { createApp };