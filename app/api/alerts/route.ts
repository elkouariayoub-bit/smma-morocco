import { NextResponse } from "next/server"
import { listAlerts } from "../store"

export async function GET() {
  return NextResponse.json({ alerts: listAlerts(20) })
}
