function escapeCsvCell(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(headers, rows) {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  return lines.join("\r\n");
}

function buildCsvFilename(slug) {
  const date = new Date().toISOString().slice(0, 10);
  return `ceda-${slug}-${date}.csv`;
}

function sendCsv(res, slug, headers, rows) {
  const csv = toCsv(headers, rows);
  const filename = buildCsvFilename(slug);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.send(`\uFEFF${csv}`);
}

module.exports = {
  buildCsvFilename,
  escapeCsvCell,
  sendCsv,
  toCsv,
};
