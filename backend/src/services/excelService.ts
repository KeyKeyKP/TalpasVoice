import ExcelJS from "exceljs";
import { WorkEntry } from "./claudeService";

export async function generateExcel(entries: WorkEntry[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("delo");

  // Define columns matching exact specification
  sheet.columns = [
    { header: "STRANKA", key: "stranka", width: 35 },
    { header: "Delo", key: "delo", width: 30 },
    { header: "Datum", key: "datum", width: 15 },
    { header: "Kontakt", key: "kontakt", width: 25 },
    { header: "Število ur", key: "stevilo_ur", width: 12 },
    { header: "Opis", key: "opis", width: 40 },
    { header: "Opravil", key: "opravil", width: 25 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9E1F2" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 20;

  // Add data rows
  for (const entry of entries) {
    const row = sheet.addRow({
      stranka: entry.stranka || "",
      delo: entry.delo || "",
      datum: entry.datum || "",
      kontakt: entry.kontakt || "",
      stevilo_ur: entry.stevilo_ur ?? "",
      opis: entry.opis || "",
      opravil: entry.opravil || "",
    });

    // Style data rows
    row.alignment = { vertical: "middle" };
    row.height = 18;

    // Format number column
    const urCell = row.getCell(5);
    if (typeof entry.stevilo_ur === "number") {
      urCell.numFmt = "0.##";
    }
  }

  // Add borders to all cells
  const lastRow = sheet.rowCount;
  for (let r = 1; r <= lastRow; r++) {
    for (let c = 1; c <= 7; c++) {
      const cell = sheet.getCell(r, c);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
  }

  // Freeze header row
  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
