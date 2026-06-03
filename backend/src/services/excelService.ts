import ExcelJS from "exceljs";
import { WorkEntry } from "./claudeService";

const TOTAL_COLS = 12;
const DATA_ROWS_EXTRA = 50; // extra blank rows with dropdowns

function applyDropdown(
  sheet: ExcelJS.Worksheet,
  colLetter: string,
  startRow: number,
  endRow: number,
  options: string
) {
  for (let r = startRow; r <= endRow; r++) {
    sheet.getCell(`${colLetter}${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`"${options}"`],
    };
  }
}

export async function generateExcel(entries: WorkEntry[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("delo");

  // Column order: A-L
  sheet.columns = [
    { header: "Opis dela", key: "opis_dela", width: 30 },
    { header: "STRANKA", key: "stranka", width: 35 },
    { header: "Kontaktna oseba", key: "kontakt", width: 25 },
    { header: "Vrsta prijave", key: "vrsta_prijave", width: 20 },
    { header: "Datum", key: "datum", width: 15 },
    { header: "Čas dela", key: "stevilo_ur", width: 12 },
    { header: "Obisk", key: "obisk", width: 10 },
    { header: "Dostop osebni podatki", key: "dostop_osebni_podatki", width: 22 },
    { header: "Podroben opis", key: "podroben_opis", width: 45 },
    { header: "Opravil", key: "opravil", width: 25 },
    { header: "Vrsta elementa", key: "vrsta_elementa", width: 18 },
    { header: "Pot", key: "pot", width: 15 },
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
      opis_dela: entry.opis_dela || "",
      stranka: entry.stranka || "",
      kontakt: entry.kontakt || "",
      vrsta_prijave: entry.vrsta_prijave || "",
      datum: entry.datum || "",
      stevilo_ur: entry.stevilo_ur != null
        ? Number(String(entry.stevilo_ur).replace(/,/g, '.').replace(/[^0-9.]/g, '')) || ""
        : "",
      obisk: entry.obisk || "",
      dostop_osebni_podatki: entry.dostop_osebni_podatki || "",
      podroben_opis: entry.podroben_opis || "",
      opravil: entry.opravil || "",
      vrsta_elementa: entry.vrsta_elementa || "",
      pot: entry.pot || "",
    });

    row.alignment = { vertical: "middle" };
    row.height = 18;

    // Format stevilo_ur (column F = 6) always as number
    const urCell = row.getCell(6);
    if (urCell.value !== "") {
      urCell.numFmt = "0.00";
    }
  }

  // Add borders to data rows
  const lastDataRow = sheet.rowCount;
  for (let r = 1; r <= lastDataRow; r++) {
    for (let c = 1; c <= TOTAL_COLS; c++) {
      const cell = sheet.getCell(r, c);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
  }

  // Add dropdown validation for data rows + 50 extra blank rows
  const firstDataRow = 2;
  const lastDropdownRow = lastDataRow + DATA_ROWS_EXTRA;

  applyDropdown(sheet, "D", firstDataRow, lastDropdownRow, "elektronska pošta,telefon,osebno,drugo");
  applyDropdown(sheet, "G", firstDataRow, lastDropdownRow, "da,ne");
  applyDropdown(sheet, "H", firstDataRow, lastDropdownRow, "da,ne");

  // Freeze header row
  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
