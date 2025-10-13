export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  getBreakdown,
  parseBreakdown,
  parseMetric,
  parsePlatform,
} from "@/lib/breakdown";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 40;
const MARGIN_Y = 40;
const TITLE_GAP = 20;
const SUBTITLE_GAP = 26;
const HEADER_GAP = 14;
const ROW_GAP = 16;

const TABLE_HEADERS = ["segment_key", "segment_label", "value", "pct"] as const;
const COLUMN_WIDTHS = [130, 220, 80, 50];

function accumulateWidth(index: number) {
  return COLUMN_WIDTHS.slice(0, index).reduce((acc, width) => acc + width, 0);
}

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

    const { rows } = await getBreakdown({ start, end, metric, by, platform });

    const pdfLib = await import("pdf-lib").catch((error) => {
      console.error("pdf-lib import failed", error);
      return null;
    });

    if (!pdfLib) {
      return NextResponse.json({ error: "pdf export unavailable" }, { status: 500 });
    }

    const { PDFDocument, StandardFonts } = pdfLib as { PDFDocument?: any; StandardFonts?: any };

    if (!PDFDocument || !StandardFonts) {
      return NextResponse.json(
        { error: "PDF exports require the pdf-lib dependency to be installed." },
        { status: 500 }
      );
    }

    const pdf = await PDFDocument.create();
    const regularFontRef = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFontRef = await pdf.embedFont(StandardFonts.HelveticaBold);

    const drawPageHeader = (page: any) => {
      let cursorY = PAGE_HEIGHT - MARGIN_Y;
      page.drawText(`Audience Breakdown — ${by.toUpperCase()} • ${metric}`, {
        x: MARGIN_X,
        y: cursorY,
        size: 16,
        font: boldFontRef,
      });
      cursorY -= TITLE_GAP;

      page.drawText(`Range: ${start} → ${end} • Platform: ${platform}`, {
        x: MARGIN_X,
        y: cursorY,
        size: 11,
        font: regularFontRef,
      });
      cursorY -= SUBTITLE_GAP;

      TABLE_HEADERS.forEach((header, index) => {
        page.drawText(header, {
          x: MARGIN_X + accumulateWidth(index),
          y: cursorY,
          size: 11,
          font: boldFontRef,
        });
      });

      return cursorY - HEADER_GAP;
    };

    let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let cursorY = drawPageHeader(page);
    const minRowY = MARGIN_Y + 20;

    for (const row of rows) {
      if (cursorY <= minRowY) {
        page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        cursorY = drawPageHeader(page);
      }

      const values = [
        row.key,
        row.label,
        String(row.value),
        row.pct != null ? `${Math.round(row.pct * 100)}%` : "",
      ];

      values.forEach((text, index) => {
        page.drawText(text, {
          x: MARGIN_X + accumulateWidth(index),
          y: cursorY,
          size: 11,
          font: regularFontRef,
        });
      });

      cursorY -= ROW_GAP;
    }

    const pdfBytes = await pdf.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="breakdown_${by}_${metric}_${start}_${end}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("/api/export/breakdown/pdf error:", error);
    return NextResponse.json({ error: "failed to export breakdown" }, { status: 500 });
  }
}
