export type Interval = { from?: Date; to?: Date }

export function serializeIntervals(intervals: Interval[]) {
  return intervals.map((range) => ({
    from: range.from ? range.from.toISOString().slice(0, 10) : "",
    to: range.to ? range.to.toISOString().slice(0, 10) : "",
  }))
}

export function buildCSV(rows: Array<[string, string]>, intervals: Interval[]) {
  const header: Array<[string, string]> = [
    ["Intervals", JSON.stringify(serializeIntervals(intervals))],
  ]
  const allRows = header.concat(rows)
  return allRows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n")
}

export async function buildXLSX(
  rows: Array<[string, string]>,
  intervals: Interval[],
): Promise<Blob> {
  const XLSX = await import("xlsx")
  const workbook = XLSX.utils.book_new()
  const sheetRows = [
    ["Intervals", JSON.stringify(serializeIntervals(intervals))],
    ...rows,
  ]
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Key Metrics")
  const arrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  return new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

export async function buildPDF(
  title: string,
  rows: Array<[string, string]>,
  intervals: Interval[],
): Promise<Blob> {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 18)
  doc.setFontSize(10)
  doc.text(`Intervals: ${JSON.stringify(serializeIntervals(intervals))}`, 14, 26)
  let y = 36
  for (const [label, value] of rows) {
    doc.text(`${label}: ${value}`, 14, y)
    y += 7
  }
  return doc.output("blob")
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
