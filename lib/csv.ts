export function toCsv(rows: Record<string, string | number>[]) {
  if (!rows.length) return ""

  const headers = Object.keys(rows[0])

  const escapeValue = (value: string | number) => {
    const stringValue = String(value)
    return /[",\n]/.test(stringValue)
      ? `"${stringValue.replace(/"/g, '""')}"`
      : stringValue
  }

  const dataLines = rows.map((row) =>
    headers.map((header) => escapeValue(row[header] ?? "")).join(",")
  )

  return [headers.join(","), ...dataLines].join("\n")
}
