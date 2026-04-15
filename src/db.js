const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function createDatabase(dbFilePath) {
  const resolvedPath = path.resolve(dbFilePath);
  ensureDirectory(path.dirname(resolvedPath));

  const database = new DatabaseSync(resolvedPath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_name TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      invoice_date TEXT,
      due_date TEXT,
      currency TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      confidence INTEGER NOT NULL,
      source_type TEXT NOT NULL,
      source_name TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return database;
}

function createInvoiceRepository(database) {
  const insertStatement = database.prepare(`
    INSERT INTO invoices (
      vendor_name,
      invoice_number,
      invoice_date,
      due_date,
      currency,
      subtotal,
      tax,
      total,
      confidence,
      source_type,
      source_name,
      raw_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const listStatement = database.prepare(`
    SELECT
      id,
      vendor_name AS vendorName,
      invoice_number AS invoiceNumber,
      invoice_date AS invoiceDate,
      due_date AS dueDate,
      currency,
      subtotal,
      tax,
      total,
      confidence,
      source_type AS sourceType,
      source_name AS sourceName,
      created_at AS createdAt
    FROM invoices
    ORDER BY id DESC
  `);

  return {
    insert(invoice) {
      const result = insertStatement.run(
        invoice.vendorName,
        invoice.invoiceNumber,
        invoice.invoiceDate,
        invoice.dueDate,
        invoice.currency,
        invoice.subtotal,
        invoice.tax,
        invoice.total,
        invoice.confidence,
        invoice.sourceType,
        invoice.sourceName,
        invoice.rawText
      );

      return {
        id: Number(result.lastInsertRowid),
        ...invoice,
      };
    },
    list() {
      return listStatement.all();
    },
  };
}

module.exports = {
  createDatabase,
  createInvoiceRepository,
};

