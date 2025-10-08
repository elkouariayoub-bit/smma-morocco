import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

import { buildMetricRows } from "@/lib/exportRows"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  if (!start || !end) {
    return NextResponse.json({ error: "start/end required" }, { status: 400 })
  }

  const rows = await buildMetricRows(start, end)

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, "Metrics")

  const rawBytes = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  }) as unknown as Uint8Array

  const bytes = Uint8Array.from(rawBytes)
  const blob = new Blob([bytes.buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="metrics_${start}_${end}.xlsx"`,
    },
  })
}
