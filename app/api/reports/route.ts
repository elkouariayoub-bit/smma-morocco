import { NextRequest, NextResponse } from 'next/server'

import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { createReportBuffer, getReportContentType, getReportFileName } from '@/lib/report-export'
import { getReportPreview, normalizeReportFilters, recordReportExport } from '@/lib/reports'
import type { ReportExportFormat } from '@/types'
import { applySupabaseCookies, createClient } from '@/lib/supabase'

function parseFiltersFromRequest(url: URL) {
  const raw: Record<string, string | null> = {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    status: url.searchParams.get('status'),
    clientId: url.searchParams.get('clientId'),
  }

  const paramsPayload = url.searchParams.get('params')
  if (paramsPayload) {
    try {
      const parsed = JSON.parse(paramsPayload)
      if (parsed && typeof parsed === 'object') {
        for (const key of ['from', 'to', 'status', 'clientId'] as const) {
          if (parsed[key] !== undefined && typeof parsed[key] === 'string') {
            raw[key] = parsed[key]
          }
        }
      }
    } catch (error) {
      console.warn('Invalid params payload supplied to /api/reports', error)
    }
  }

  return raw
}

function isExportFormat(type: string): type is ReportExportFormat {
  return type === 'csv' || type === 'pdf' || type === 'excel'
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type') ?? 'preview'

  const supabaseResponse = NextResponse.next()
  const supabase = createClient({ request, response: supabaseResponse })
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('Failed to retrieve session for reports API', sessionError)
    const response = NextResponse.json({ error: 'Unable to verify authentication' }, { status: 500 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }

  if (!session?.user?.id) {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }

  const filtersInput = parseFiltersFromRequest(url)
  const filters = normalizeReportFilters(filtersInput)

  try {
    const preview = await getReportPreview(filters, { userId: session.user.id })

    if (type === 'preview') {
      const response = NextResponse.json({ report: preview })
      applySupabaseCookies(supabaseResponse, response)
      return response
    }

    if (!isExportFormat(type)) {
      const response = NextResponse.json({ error: 'Unsupported report format' }, { status: 400 })
      applySupabaseCookies(supabaseResponse, response)
      return response
    }

    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]
    const identifier = getRateLimitIdentifier(ip, `reports-${type}`)
    const rateLimit = checkRateLimit(identifier, 20, 60_000)

    if (!rateLimit.allowed) {
      const headers: Record<string, string> = {}
      if (rateLimit.retryAfter !== undefined) {
        headers['Retry-After'] = Math.ceil(rateLimit.retryAfter / 1000).toString()
      }
      const response = NextResponse.json(
        { error: 'Too many export requests. Please try again shortly.' },
        { status: 429, headers }
      )
      applySupabaseCookies(supabaseResponse, response)
      return response
    }

    const buffer = await createReportBuffer(preview, type)

    await recordReportExport(type, session.user.id)

    const response = new NextResponse(buffer, {
      headers: {
        'Content-Type': getReportContentType(type),
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `attachment; filename="${getReportFileName(preview, type)}"`,
        'Cache-Control': 'no-store',
      },
    })

    applySupabaseCookies(supabaseResponse, response)
    return response
  } catch (error) {
    console.error('Failed to generate report', error)
    const response = NextResponse.json({ error: 'Unable to generate report at this time' }, { status: 500 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }
}
