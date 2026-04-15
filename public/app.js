const uploadForm = document.getElementById("uploadForm");
const textForm = document.getElementById("textForm");
const invoiceFileInput = document.getElementById("invoiceFile");
const invoiceTextInput = document.getElementById("invoiceText");
const resultState = document.getElementById("resultState");
const resultCard = document.getElementById("resultCard");
const invoiceTableBody = document.getElementById("invoiceTableBody");

const fields = {
  vendorName: document.getElementById("vendorName"),
  invoiceNumber: document.getElementById("invoiceNumber"),
  invoiceDate: document.getElementById("invoiceDate"),
  dueDate: document.getElementById("dueDate"),
  subtotal: document.getElementById("subtotal"),
  tax: document.getElementById("tax"),
  total: document.getElementById("total"),
  confidence: document.getElementById("confidence"),
};

function formatCurrency(currency, amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function showInvoice(invoice) {
  resultState.classList.add("hidden");
  resultCard.classList.remove("hidden");
  fields.vendorName.textContent = invoice.vendorName;
  fields.invoiceNumber.textContent = invoice.invoiceNumber;
  fields.invoiceDate.textContent = invoice.invoiceDate || "-";
  fields.dueDate.textContent = invoice.dueDate || "-";
  fields.subtotal.textContent = formatCurrency(invoice.currency, invoice.subtotal);
  fields.tax.textContent = formatCurrency(invoice.currency, invoice.tax);
  fields.total.textContent = formatCurrency(invoice.currency, invoice.total);
  fields.confidence.textContent = `${invoice.confidence}%`;
}

function renderTable(invoices) {
  if (!invoices.length) {
    invoiceTableBody.innerHTML = '<tr><td colspan="7" class="placeholder">No invoices stored yet.</td></tr>';
    return;
  }

  invoiceTableBody.innerHTML = invoices.map((invoice) => `
    <tr>
      <td>${invoice.id}</td>
      <td>${invoice.vendorName}</td>
      <td>${invoice.invoiceNumber}</td>
      <td>${invoice.invoiceDate || "-"}</td>
      <td>${formatCurrency(invoice.currency, invoice.total)}</td>
      <td>${invoice.sourceType}</td>
      <td>${new Date(invoice.createdAt).toLocaleString()}</td>
    </tr>
  `).join("");
}

async function loadInvoices() {
  const response = await fetch("/api/invoices");
  const data = await response.json();
  renderTable(data.invoices);
}

async function handleResponse(response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Invoice processing failed.");
  }

  showInvoice(payload.invoice);
  await loadInvoices();
}

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!invoiceFileInput.files[0]) {
    resultState.textContent = "Please choose an invoice file first.";
    resultState.classList.remove("hidden");
    resultCard.classList.add("hidden");
    return;
  }

  const formData = new FormData();
  formData.append("invoice", invoiceFileInput.files[0]);

  try {
    resultState.textContent = "Processing uploaded invoice...";
    resultState.classList.remove("hidden");
    resultCard.classList.add("hidden");
    const response = await fetch("/api/invoices/upload", {
      method: "POST",
      body: formData,
    });
    await handleResponse(response);
  } catch (error) {
    resultState.textContent = error.message;
    resultState.classList.remove("hidden");
    resultCard.classList.add("hidden");
  }
});

textForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    resultState.textContent = "Processing text invoice...";
    resultState.classList.remove("hidden");
    resultCard.classList.add("hidden");
    const response = await fetch("/api/invoices/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: invoiceTextInput.value,
      }),
    });
    await handleResponse(response);
  } catch (error) {
    resultState.textContent = error.message;
    resultState.classList.remove("hidden");
    resultCard.classList.add("hidden");
  }
});

loadInvoices().catch((error) => {
  resultState.textContent = error.message;
});

