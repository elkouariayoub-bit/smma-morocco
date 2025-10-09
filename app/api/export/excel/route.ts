export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { buildMetricRows } from "@/lib/exportRows";

type ExcelJSModule = typeof import("exceljs");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "start/end required" }, { status: 400 });
    }

    const ExcelJSImport = (await import("exceljs")) as ExcelJSModule;
    const ExcelJS = ExcelJSImport.default ?? ExcelJSImport;

    const rows = await buildMetricRows(start, end);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SMMA Dashboard";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Metrics", {
      properties: { defaultRowHeight: 18 },
      views: [{ state: "frozen", ySplit: 1 }],
    });

    worksheet.columns = [
      { header: "date", key: "date", width: 14 },
      { header: "engagement_rate", key: "engagement_rate", width: 18 },
      { header: "impressions", key: "impressions", width: 14 },
      { header: "people", key: "people", width: 12 },
    ];

    worksheet.addRows(rows);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: "middle" };
    headerRow.eachCell((cell: any) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
      cell.border = { bottom: { style: "thin", color: { argb: "FFCCCCCC" } } };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="metrics_${start}_${end}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("/api/export/excel error:", error);
    return NextResponse.json({ error: "failed to export metrics" }, { status: 500 });
  }
}
