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
  app.use(express.static(path.resolve(__dirname, "../public")));

  app.get("/api/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "invoice-processing-system",
      storedInvoices: repository.list().length,
    });
  });

  app.get("/api/invoices", (_request, response) => {
    response.json({
      invoices: repository.list(),
    });
  });

  app.post("/api/invoices/text", (request, response, next) => {
    try {
      const invoice = extractInvoiceFields(request.body.text || "", {
        sourceType: "manual-text",
        sourceName: request.body.sourceName || "dashboard-input",
      });

      const savedInvoice = repository.insert(invoice);
      response.status(201).json({ invoice: savedInvoice });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/invoices/upload", upload.single("invoice"), async (request, response, next) => {
    try {
      const invoice = await processUploadedInvoice(request.file);
      const savedInvoice = repository.insert(invoice);
      response.status(201).json({ invoice: savedInvoice });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _request, response) => {
    response.status(400).json({
      error: error.message || "Invoice processing failed.",
    });
  });

  return app;
}

module.exports = {
  createApp,
};
