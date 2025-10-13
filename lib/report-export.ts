import { PDFDocument, StandardFonts } from 'pdf-lib'
import { utils, write } from 'xlsx'

import type { ReportExportFormat, ReportPreview } from '@/types'

const CONTENT_TYPES: Record<ReportExportFormat, string> = {
  csv: 'text/csv; charset=utf-8',
  pdf: 'application/pdf',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

const FILE_EXTENSIONS: Record<ReportExportFormat, string> = {
  csv: 'csv',
  pdf: 'pdf',
  excel: 'xlsx',
}

export function getReportContentType(format: ReportExportFormat) {
  return CONTENT_TYPES[format]
}

export function getReportFileName(preview: ReportPreview, format: ReportExportFormat) {
  const extension = FILE_EXTENSIONS[format]
  const { from, to } = preview.filters
  return `smma-report-${from}-${to}.${extension}`
}

export async function createReportBuffer(preview: ReportPreview, format: ReportExportFormat) {
  switch (format) {
    case 'csv':
      return buildCsv(preview)
    case 'pdf':
      return buildPdf(preview)
    case 'excel':
      return buildExcel(preview)
    default:
      throw new Error(`Unsupported report format: ${format}`)
  }
}

function buildCsv(preview: ReportPreview) {
  const header = ['Campaign', 'Client', 'Status', 'Start date', 'End date', 'Impressions', 'Clicks', 'CTR (%)', 'Conversions', 'Spend (MAD)', 'ROI']
  const rows = preview.rows.map((row) => [
    row.campaign,
    row.client,
    row.status,
    row.startDate,
    row.endDate ?? '—',
    row.impressions.toString(),
    row.clicks.toString(),
    row.ctr.toFixed(2),
    row.conversions.toString(),
    row.spend.toFixed(2),
    row.roi.toFixed(2),
  ])
  const csv = [header, ...rows]
    .map((line) => line.map(escapeCsvCell).join(','))
    .join('\n')
  return Buffer.from(csv, 'utf-8')
}

function escapeCsvCell(value: string) {
  if (/,|"|\n/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

async function buildPdf(preview: ReportPreview) {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([612, 792])
  let cursorY = 742
  const marginX = 48

  const drawText = (text: string, options: { size?: number; font?: typeof font; x?: number; y?: number }) => {
    const { size = 12, font: fontOption = font, x = marginX, y = cursorY } = options
    page.drawText(text, { x, y, size, font: fontOption })
    cursorY = y
  }

  drawText('Campaign Performance Report', { size: 20, font: boldFont, y: cursorY })
  cursorY -= 28
  drawText(`Reporting window: ${preview.filters.from} → ${preview.filters.to}`, { size: 12 })
  cursorY -= 18
  drawText(`Generated at: ${new Date(preview.generatedAt).toLocaleString()}`, { size: 10 })
  cursorY -= 28

  const summaryLines = [
    `Total campaigns: ${preview.totalRows}`,
    `Total spend (MAD): ${preview.summary.totalSpend.toFixed(2)}`,
    `Total impressions: ${preview.summary.totalImpressions}`,
    `Total clicks: ${preview.summary.totalClicks}`,
    `Average CTR (%): ${preview.summary.averageCtr.toFixed(2)}`,
    `Average ROI: ${preview.summary.averageRoi.toFixed(2)}`,
  ]

  for (const line of summaryLines) {
    drawText(line, { size: 11 })
    cursorY -= 16
  }

  cursorY -= 12
  drawText('Top campaigns', { size: 14, font: boldFont })
  cursorY -= 20

  const rows = preview.rows.slice(0, 12)
  for (const row of rows) {
    if (cursorY < 72) {
      page = pdfDoc.addPage([612, 792])
      cursorY = 742
      drawText('Top campaigns (cont.)', { size: 14, font: boldFont })
      cursorY -= 24
    }

    const entryLines = [
      `${row.campaign} • ${row.client}`,
      `Status: ${row.status} | Dates: ${row.startDate} → ${row.endDate ?? '—'}`,
      `Impressions: ${row.impressions} | Clicks: ${row.clicks} | CTR: ${row.ctr.toFixed(2)}%`,
      `Conversions: ${row.conversions} | Spend: MAD ${row.spend.toFixed(2)} | ROI: ${row.roi.toFixed(2)}`,
    ]

    for (const line of entryLines) {
      drawText(line, { size: 11 })
      cursorY -= 14
    }

    cursorY -= 6
  }

  return Buffer.from(await pdfDoc.save())
}

function buildExcel(preview: ReportPreview) {
  const workbook = utils.book_new()

  const header = ['Campaign', 'Client', 'Status', 'Start date', 'End date', 'Impressions', 'Clicks', 'CTR (%)', 'Conversions', 'Spend (MAD)', 'ROI']
  const rows = preview.rows.map((row) => [
    row.campaign,
    row.client,
    row.status,
    row.startDate,
    row.endDate ?? '—',
    row.impressions,
    row.clicks,
    Number(row.ctr.toFixed(2)),
    row.conversions,
    Number(row.spend.toFixed(2)),
    Number(row.roi.toFixed(2)),
  ])

  const worksheet = utils.aoa_to_sheet([header, ...rows])
  utils.book_append_sheet(workbook, worksheet, 'Campaigns')

  const summarySheet = utils.aoa_to_sheet([
    ['Metric', 'Value'],
    ['Total campaigns', preview.totalRows],
    ['Total spend (MAD)', Number(preview.summary.totalSpend.toFixed(2))],
    ['Total impressions', preview.summary.totalImpressions],
    ['Total clicks', preview.summary.totalClicks],
    ['Average CTR (%)', Number(preview.summary.averageCtr.toFixed(2))],
    ['Average ROI', Number(preview.summary.averageRoi.toFixed(2))],
  ])
  utils.book_append_sheet(workbook, summarySheet, 'Summary')

  const buffer = write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  return Buffer.from(new Uint8Array(buffer))
}
