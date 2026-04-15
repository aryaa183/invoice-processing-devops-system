const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../src/app");

function createTempApp() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "invoice-system-"));
  return createApp({
    dataDirectory: path.join(tempRoot, "data"),
    uploadDirectory: path.join(tempRoot, "uploads"),
  });
}

test("GET /api/health returns ok status", async () => {
  const app = createTempApp();
  const response = await request(app).get("/api/health");
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, "ok");
});

test("POST /api/invoices/text stores extracted invoice", async () => {
  const app = createTempApp();
  const response = await request(app)
    .post("/api/invoices/text")
    .send({
      text: [
        "Orbit Supplies",
        "Invoice Number: INV-120",
        "Invoice Date: 2026-04-13",
        "Subtotal: INR 1000",
        "Tax: INR 180",
        "Total: INR 1180",
      ].join("\n"),
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.invoice.vendorName, "Orbit Supplies");
  assert.equal(response.body.invoice.total, 1180);
});

test("POST /api/invoices/upload accepts plain text invoice files", async () => {
  const app = createTempApp();
  const sampleInvoicePath = path.resolve(__dirname, "../samples/invoices/sample-invoice.txt");

  const response = await request(app)
    .post("/api/invoices/upload")
    .attach("invoice", sampleInvoicePath);

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.invoice.invoiceNumber, "INV-2026-014");
});

