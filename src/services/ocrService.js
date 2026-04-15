const fs = require("node:fs/promises");
const path = require("node:path");
const Tesseract = require("tesseract.js");
const { extractInvoiceFields } = require("./invoiceParser");

async function extractTextFromFile(file) {
  if (!file) {
    throw new Error("No invoice file was uploaded.");
  }

  if (file.mimetype === "text/plain") {
    return fs.readFile(file.path, "utf8");
  }

  if (!file.mimetype.startsWith("image/")) {
    throw new Error("Only image and plain text invoice uploads are supported in this demo.");
  }

  const result = await Tesseract.recognize(file.path, "eng");
  return result.data.text;
}

async function processUploadedInvoice(file) {
  const rawText = await extractTextFromFile(file);

  return extractInvoiceFields(rawText, {
    sourceType: file.mimetype.startsWith("image/") ? "ocr-image" : "text-file",
    sourceName: path.basename(file.originalname || file.filename),
  });
}

module.exports = {
  extractTextFromFile,
  processUploadedInvoice,
};

