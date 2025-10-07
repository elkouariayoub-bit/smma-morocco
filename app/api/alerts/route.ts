import { NextRequest, NextResponse } from "next/server"

import { listAlerts } from "../store"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get("limit")

  if (limitParam && limitParam.trim().length === 0) {
    return NextResponse.json({ error: "limit must not be empty" }, { status: 400 })
  }

  const parsedLimit = limitParam ? Number(limitParam) : DEFAULT_LIMIT

  if (Number.isNaN(parsedLimit)) {
    return NextResponse.json({ error: "limit must be a number" }, { status: 400 })
  }

  const limit = Math.min(Math.max(Math.trunc(parsedLimit), 1), MAX_LIMIT)

  return NextResponse.json({ alerts: listAlerts(limit) })
}
