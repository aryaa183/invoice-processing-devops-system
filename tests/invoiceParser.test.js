const test = require("node:test");
const assert = require("node:assert/strict");
const { extractInvoiceFields } = require("../src/services/invoiceParser");

test("extractInvoiceFields parses key invoice attributes", () => {
  const invoice = extractInvoiceFields(`
    Bright Stationery Pvt Ltd
    Invoice Number: INV-2026-014
    Invoice Date: 2026-04-11
    Due Date: 2026-04-20
    Subtotal: INR 12500
    Tax: INR 2250
    Total: INR 14750
  `);

  assert.equal(invoice.vendorName, "Bright Stationery Pvt Ltd");
  assert.equal(invoice.invoiceNumber, "INV-2026-014");
  assert.equal(invoice.invoiceDate, "2026-04-11");
  assert.equal(invoice.dueDate, "2026-04-20");
  assert.equal(invoice.currency, "INR");
  assert.equal(invoice.subtotal, 12500);
  assert.equal(invoice.tax, 2250);
  assert.equal(invoice.total, 14750);
  assert.equal(invoice.confidence, 100);
});

test("extractInvoiceFields infers total when total line is missing", () => {
  const invoice = extractInvoiceFields(`
    Nova Electronics
    Invoice No: INV-88
    Date: 12/04/2026
    Subtotal: INR 5000
    GST: INR 900
  `);

  assert.equal(invoice.total, 5900);
  assert.equal(invoice.vendorName, "Nova Electronics");
});

