export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { buildMetricRows } from "@/lib/exportRows";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    if (!start || !end) return NextResponse.json({ error: "start/end required" }, { status: 400 });

    // import inside handler so Next doesn’t try to analyze on edge
    // @ts-expect-error exceljs type definitions are not available in this environment
    const ExcelJS = (await import("exceljs")).default;
    const rows = await buildMetricRows(start, end);

    const wb = new ExcelJS.Workbook();
    wb.creator = "SMMA Dashboard";
    wb.created = new Date();
    const ws = wb.addWorksheet("Metrics", { views: [{ state: "frozen", ySplit: 1 }] });

    ws.columns = [
      { header: "date", key: "date", width: 14 },
      { header: "engagement_rate", key: "engagement_rate", width: 18 },
      { header: "impressions", key: "impressions", width: 14 },
      { header: "people", key: "people", width: 12 },
    ];
    ws.addRows(rows);

    ws.getRow(1).font = { bold: true };

    const buffer = await wb.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="metrics_${start}_${end}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("/api/export/excel error:", err);
    return NextResponse.json({ error: "failed to export metrics" }, { status: 500 });
  }
}
