const { z } = require("zod");

const extractedInvoiceSchema = z.object({
  vendorName: z.string().min(2),
  invoiceNumber: z.string().min(2),
  invoiceDate: z.string().min(1).nullable(),
  dueDate: z.string().min(1).nullable(),
  currency: z.string().min(3).max(3),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().positive(),
  confidence: z.number().int().min(0).max(100),
  rawText: z.string().min(1),
  sourceType: z.string().min(1),
  sourceName: z.string().min(1),
});

function normalizeText(text) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getLineValue(lines, labelPatterns) {
  for (const pattern of labelPatterns) {
    const matchedLine = lines.find((line) => pattern.test(line));
    if (matchedLine) {
      const colonIndex = matchedLine.indexOf(":");
      if (colonIndex >= 0) {
        return matchedLine.slice(colonIndex + 1).trim() || null;
      }

      const hashIndex = matchedLine.indexOf("#");
      if (hashIndex >= 0) {
        return matchedLine.slice(hashIndex + 1).trim() || null;
      }

      return matchedLine.replace(pattern, "").trim() || null;
    }
  }

  return null;
}

function parseAmount(fragment) {
  if (!fragment) {
    return null;
  }

  const match = fragment.match(/(?:INR|Rs\.?|USD|\$|EUR|€)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i);
  if (!match) {
    return null;
  }

  return Number.parseFloat(match[1].replace(/,/g, ""));
}

function detectCurrency(text) {
  if (/\bUSD\b|\$/i.test(text)) {
    return "USD";
  }
  if (/\bEUR\b|€/i.test(text)) {
    return "EUR";
  }
  return "INR";
}

function findAmountFromLine(lines, patterns) {
  const value = getLineValue(lines, patterns);
  return parseAmount(value);
}

function inferVendorName(lines) {
  return lines.find((line) => /^[A-Za-z][A-Za-z0-9 .,&()-]{2,}$/.test(line)) || "Unknown Vendor";
}

function extractInvoiceFields(text, metadata = {}) {
  const rawText = normalizeText(text);
  const lines = rawText.split("\n").map((line) => line.trim()).filter(Boolean);

  const invoiceNumber =
    getLineValue(lines, [/invoice\s*(number|no|#)/i, /bill\s*(number|no|#)/i]) ||
    rawText.match(/\bINV[-/ ]?\d+\b/i)?.[0] ||
    "UNSPECIFIED";

  const invoiceDate =
    getLineValue(lines, [/invoice\s*date/i, /^date\b/i]) ||
    rawText.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ||
    rawText.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/)?.[0] ||
    null;

  const dueDate =
    getLineValue(lines, [/due\s*date/i, /payment\s*due/i]) ||
    null;

  const subtotal =
    findAmountFromLine(lines, [/subtotal/i, /amount before tax/i, /taxable amount/i]) ||
    0;
  const tax =
    findAmountFromLine(lines, [/\btax\b/i, /gst/i, /vat/i]) ||
    0;
  const total =
    findAmountFromLine(lines, [/grand total/i, /total amount/i, /^total\b/i, /amount due/i]) ||
    subtotal + tax;

  const confidenceSignals = [
    invoiceNumber !== "UNSPECIFIED",
    Boolean(invoiceDate),
    total > 0,
    inferVendorName(lines) !== "Unknown Vendor",
  ];

  const confidence = Math.round((confidenceSignals.filter(Boolean).length / confidenceSignals.length) * 100);

  return extractedInvoiceSchema.parse({
    vendorName: inferVendorName(lines),
    invoiceNumber,
    invoiceDate,
    dueDate,
    currency: detectCurrency(rawText),
    subtotal,
    tax,
    total,
    confidence,
    rawText,
    sourceType: metadata.sourceType || "text",
    sourceName: metadata.sourceName || "manual-entry",
  });
}

module.exports = {
  extractInvoiceFields,
  extractedInvoiceSchema,
};
