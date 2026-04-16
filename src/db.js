const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function createDatabase(dbFilePath) {
  const resolvedPath = path.resolve(dbFilePath);
  ensureDirectory(path.dirname(resolvedPath));

  const db = new Database(resolvedPath);

  db.exec(`
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

  return db;
}

function createInvoiceRepository(db) {
  return {
    insert(invoice) {
      const query = db.prepare(`
        INSERT INTO invoices (
          vendor_name, invoice_number, invoice_date, due_date,
          currency, subtotal, tax, total, confidence,
          source_type, source_name, raw_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = query.run(
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

      return { id: result.lastInsertRowid, ...invoice };
    },

    list() {
      return db.prepare(`
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
      `).all();
    },
  };
}

module.exports = {
  createDatabase,
  createInvoiceRepository,
};