export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"

import { buildMetricRows } from "@/lib/exportRows"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    if (!start || !end) {
      return NextResponse.json({ error: "start/end required" }, { status: 400 })
    }

    const XLSX = await import("xlsx") as unknown as {
      utils: typeof import("xlsx").utils
      write: typeof import("xlsx").write
      __xlsxLoadError?: Error
    }

    if (XLSX.__xlsxLoadError) {
      console.error("xlsx module failed to load", XLSX.__xlsxLoadError)
      return NextResponse.json(
        { error: "xlsx module unavailable" },
        { status: 500 }
      )
    }
    const rows = await buildMetricRows(start, end)

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Metrics")

    const arrayBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    }) as ArrayBuffer

    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="metrics_${start}_${end}.xlsx"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Failed to export metrics as Excel", error)
    return NextResponse.json({ error: "failed to export metrics" }, { status: 500 })
  }
}
