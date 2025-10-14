export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  getBreakdown,
  parseBreakdown,
  parseMetric,
  parsePlatform,
} from "@/lib/breakdown";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "start/end required" }, { status: 400 });
    }

    const metric = parseMetric(searchParams.get("metric"));
    const by = parseBreakdown(searchParams.get("by"));
    const platform = parsePlatform(searchParams.get("platform"));

    let ExcelJSImport: any;
    try {
      ExcelJSImport = await import("exceljs");
    } catch (error) {
      console.error("exceljs import failed", error);
      return NextResponse.json({ error: "excel export unavailable" }, { status: 500 });
    }

    const ExcelJS = (ExcelJSImport as { default?: any }).default ?? ExcelJSImport;

    if (typeof (ExcelJS as any)?.Workbook !== "function") {
      return NextResponse.json(
        { error: "Excel exports require the exceljs dependency to be installed." },
        { status: 500 }
      );
    }

    const { rows } = await getBreakdown({ start, end, metric, by, platform });

    const workbook = new (ExcelJS as { Workbook: new () => any }).Workbook();
    workbook.creator = "SMMA Dashboard";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Breakdown", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    worksheet.columns = [
      { header: "segment_key", key: "segment_key", width: 18 },
      { header: "segment_label", key: "segment_label", width: 24 },
      { header: "value", key: "value", width: 14 },
      { header: "pct", key: "pct", width: 10 },
    ];

    worksheet.addRows(
      rows.map((r) => ({
        segment_key: r.key,
        segment_label: r.label,
        value: r.value,
        pct: r.pct != null ? Math.round(r.pct * 100) : "",
      }))
    );

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="breakdown_${by}_${metric}_${start}_${end}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("/api/export/breakdown/excel error:", error);
    return NextResponse.json({ error: "failed to export breakdown" }, { status: 500 });
  }
}
