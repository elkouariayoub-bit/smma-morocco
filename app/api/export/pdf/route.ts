import { NextResponse } from "next/server"

import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { buildMetricRows } from "@/lib/exportRows"

export const runtime = "nodejs"

const PAGE_SIZE: [number, number] = [612, 792]
const MARGIN = 40
const START_Y = 740
const LINE_HEIGHT = 18
const HEADER_GAP = 14
const HEADER_LINE_GAP = 10

const HEADERS = ["date", "engagement_rate", "impressions", "people"] as const
const COLUMN_X = [MARGIN, MARGIN + 140, MARGIN + 300, MARGIN + 430]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")
  if (!start || !end) return NextResponse.json({ error: "start/end required" }, { status: 400 })

  const rows = await buildMetricRows(start, end)

  const pdfDoc = (await PDFDocument.create()) as any
  const font = await pdfDoc.embedFont((StandardFonts as any).Helvetica)
  const fontBold = await pdfDoc.embedFont((StandardFonts as any).HelveticaBold)

  let page = pdfDoc.addPage(PAGE_SIZE)
  let y = START_Y

  page.drawText("Social Metrics Report", { x: MARGIN, y, size: 18, font: fontBold })
  y -= 24
  page.drawText(`Range: ${start} to ${end}`, { x: MARGIN, y, size: 12, font })
  y -= 28

  const drawTableHeader = (targetPage: any, startY: number) => {
    HEADERS.forEach((header, index) => {
      targetPage.drawText(header, {
        x: COLUMN_X[index],
        y: startY,
        size: 11,
        font: fontBold,
        color: (rgb as any)(0, 0, 0),
      })
    })

    const nextY = startY - HEADER_GAP
    targetPage.drawLine({
      start: { x: MARGIN, y: nextY },
      end: { x: PAGE_SIZE[0] - MARGIN, y: nextY },
      thickness: 1,
      color: (rgb as any)(0.8, 0.8, 0.8),
    })

    return nextY - HEADER_LINE_GAP
  }

  y = drawTableHeader(page, y)

  const ensureSpace = () => {
    if (y >= 60) return
    page = pdfDoc.addPage(PAGE_SIZE)
    y = START_Y
    y = drawTableHeader(page, y)
  }

  rows.forEach((row) => {
    ensureSpace()
    page.drawText(String(row.date), { x: COLUMN_X[0], y, size: 11, font })
    page.drawText(String(row.engagement_rate), { x: COLUMN_X[1], y, size: 11, font })
    page.drawText(String(row.impressions), { x: COLUMN_X[2], y, size: 11, font })
    page.drawText(String(row.people), { x: COLUMN_X[3], y, size: 11, font })
    y -= LINE_HEIGHT
  })

  const bytes = await pdfDoc.save()
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="metrics_${start}_${end}.pdf"`,
    },
  })
}
