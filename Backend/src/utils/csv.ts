// Backend/src/utils/csv.ts
export function escapeCSV(val: any): string {
  if (val === null || val === undefined) return "";
  let str = typeof val === "object" ? JSON.stringify(val) : String(val);
  str = str.replace(/"/g, '""');
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    str = `"${str}"`;
  }
  return str;
}

export function generateCSV<T extends Record<string, any>>(
  data: T[],
  headers: string[],
  columnMap?: Record<string, string>
): string {
  let csv = headers.join(",") + "\n";

  data.forEach((row) => {
    const rowValues = Object.keys(row).map((key) => {
      const columnKey = columnMap?.[key] || key;
      return escapeCSV(row[columnKey]);
    });
    csv += rowValues.join(",") + "\n";
  });

  return csv;
}