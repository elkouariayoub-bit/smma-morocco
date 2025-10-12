export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { buildMetricRows } from "@/lib/exportRows";

const PAGE_SIZE: [number, number] = [612, 792]
const PAGE_WIDTH = PAGE_SIZE[0]
const PAGE_HEIGHT = PAGE_SIZE[1]
const MARGIN = 40
const START_Y = PAGE_HEIGHT - 52
const TITLE_GAP = 24
const SUBTITLE_GAP = 28
const LINE_HEIGHT = 18
const HEADER_GAP = 14
const HEADER_LINE_GAP = 10
const MIN_Y = 60

const HEADERS = ["date", "engagement_rate", "impressions", "people"] as const
const COLUMN_X = [MARGIN, MARGIN + 140, MARGIN + 300, MARGIN + 430] as const

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "start/end required" }, { status: 400 });
    }

    let mod: any;
    try {
      mod = await import("pdf-lib");
    } catch (error) {
      console.error("pdf-lib import failed", error);
      return NextResponse.json({ error: "pdf generation unavailable" }, { status: 500 });
    }

    if ((mod as { __isStub?: boolean }).__isStub || mod.default?.__isStub) {
      return NextResponse.json(
        { error: "PDF exports require the pdf-lib dependency to be installed." },
        { status: 500 }
      );
    }

    const PDFDocument = mod.PDFDocument ?? mod.default?.PDFDocument;
    const StandardFonts = mod.StandardFonts ?? mod.default?.StandardFonts;
    const rgb = mod.rgb ?? mod.default?.rgb;

    if (!PDFDocument || !StandardFonts || !rgb) {
      console.error("pdf-lib exports missing", Object.keys(mod ?? {}));
      return NextResponse.json({ error: "pdf generation unavailable" }, { status: 500 });
    }

    const rows = await buildMetricRows(start, end);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const addPage = () => pdfDoc.addPage(PAGE_SIZE);

    const drawHeader = (target: ReturnType<typeof addPage>, startY: number) => {
      let nextY = startY;
      HEADERS.forEach((header, index) => {
        target.drawText(header, {
          x: COLUMN_X[index],
          y: nextY,
          size: 11,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
      });

      nextY -= HEADER_GAP;
      target.drawLine({
        start: { x: MARGIN, y: nextY },
        end: { x: PAGE_WIDTH - MARGIN, y: nextY },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });

      return nextY - HEADER_LINE_GAP;
    };

    let page = addPage();
    let y = START_Y;

    page.drawText("Social Metrics Report", { x: MARGIN, y, size: 18, font: fontBold });
    y -= TITLE_GAP;
    page.drawText(`Range: ${start} to ${end}`, { x: MARGIN, y, size: 12, font });
    y -= SUBTITLE_GAP;

    y = drawHeader(page, y);

    rows.forEach((row) => {
      if (y < MIN_Y) {
        page = addPage();
        y = START_Y;
        y = drawHeader(page, y);
      }

      page.drawText(String(row.date), { x: COLUMN_X[0], y, size: 11, font });
      page.drawText(String(row.engagement_rate), { x: COLUMN_X[1], y, size: 11, font });
      page.drawText(String(row.impressions), { x: COLUMN_X[2], y, size: 11, font });
      page.drawText(String(row.people), { x: COLUMN_X[3], y, size: 11, font });
      y -= LINE_HEIGHT;
    });

    const bytes = await pdfDoc.save();
    const buffer = Buffer.from(bytes);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="metrics_${start}_${end}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("/api/export/pdf error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
