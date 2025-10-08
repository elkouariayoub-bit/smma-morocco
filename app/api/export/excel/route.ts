export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createRequire } from "module";
import { pathToFileURL } from "url";

import { buildMetricRows } from "@/lib/exportRows";

const require = createRequire(import.meta.url);

function resolveModule(specifier: string) {
  try {
    return require.resolve(specifier);
  } catch {
    return null;
  }
}

async function loadXlsx() {
  const resolvedCjs = resolveModule("xlsx");
  if (resolvedCjs) {
    const fileUrl = pathToFileURL(resolvedCjs).href;
    return import(/* webpackIgnore: true */ fileUrl);
  }

  const resolvedEsm = resolveModule("xlsx/xlsx.mjs");
  if (resolvedEsm) {
    const fileUrl = pathToFileURL(resolvedEsm).href;
    return import(/* webpackIgnore: true */ fileUrl);
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "start/end required" }, { status: 400 });
    }

    const XLSX = await loadXlsx();
    if (!XLSX) {
      return NextResponse.json({ error: "xlsx module unavailable" }, { status: 500 });
    }

    const rows = await buildMetricRows(start, end);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Metrics");

    const arrayBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    }) as ArrayBuffer;

    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="metrics_${start}_${end}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to export metrics as Excel", error);
    return NextResponse.json({ error: "failed to export metrics" }, { status: 500 });
  }
}
