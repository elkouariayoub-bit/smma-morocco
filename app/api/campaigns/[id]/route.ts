import { NextRequest, NextResponse } from 'next/server'

import {
  mapCampaign,
  normalizeCampaignDate,
  normalizeCampaignMilestones,
  parseCampaignUpdate,
  type CampaignRow,
  ZodError,
} from '@/lib/campaigns'

import { applyCampaignsRateLimit, getSupabaseSession } from '../utils'

type RouteContext = {
  params: { id: string }
}

function isValidUuid(value: string | undefined) {
  return Boolean(value && /^[0-9a-fA-F-]{36}$/.test(value))
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = context.params

  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'Invalid campaign id' }, { status: 400 })
  }

  let session
  try {
    session = await getSupabaseSession()
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
  }

  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { supabase, userId } = session

  const { data, error } = await supabase
    .from('campaigns')
    .select(
      'id, user_id, client_id, name, description, status, start_date, end_date, position, milestones, metadata, created_at, updated_at, clients(name)',
    )
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    console.error('Error fetching campaign', error)
    return NextResponse.json({ error: 'Unable to load campaign' }, { status: 500 })
  }

  const campaign = mapCampaign(data as CampaignRow)

  return NextResponse.json({ campaign })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const rateLimitResponse = applyCampaignsRateLimit(request, 'update', 40, 60_000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const { id } = context.params

  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'Invalid campaign id' }, { status: 400 })
  }

  let payload
  try {
    const body = await request.json()
    payload = parseCampaignUpdate(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request payload' }, { status: 422 })
    }
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  let session
  try {
    session = await getSupabaseSession()
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
  }

  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { supabase, userId } = session

  const { data: existing, error: existingError } = await supabase
    .from('campaigns')
    .select(
      'id, user_id, client_id, name, description, status, start_date, end_date, position, milestones, metadata, created_at, updated_at, clients(name)',
    )
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (existingError || !existing) {
    if (existingError?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    console.error('Unable to load campaign before update', existingError)
    return NextResponse.json({ error: 'Unable to update campaign' }, { status: 500 })
  }

  const baseRow = existing as CampaignRow

  const updates: Record<string, unknown> = {}

  if (payload.name !== undefined) {
    updates.name = payload.name
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'clientId')) {
    updates.client_id = payload.clientId ?? null
  }

  if (payload.status !== undefined) {
    updates.status = payload.status
  }

  if (payload.description !== undefined) {
    updates.description = payload.description ?? null
  }

  let nextStart = normalizeCampaignDate(baseRow.start_date)
  if (payload.startDate !== undefined) {
    nextStart = normalizeCampaignDate(payload.startDate)
    updates.start_date = nextStart
  }

  let nextEnd = baseRow.end_date
  if (Object.prototype.hasOwnProperty.call(payload, 'endDate')) {
    nextEnd = payload.endDate ? normalizeCampaignDate(payload.endDate) : null
    updates.end_date = nextEnd
  }

  if (payload.milestones !== undefined) {
    updates.milestones = normalizeCampaignMilestones(payload.milestones, {
      startDate: nextStart,
      endDate: nextEnd ?? null,
    })
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select(
      'id, user_id, client_id, name, description, status, start_date, end_date, position, milestones, metadata, created_at, updated_at, clients(name)',
    )
    .single()

  if (error || !data) {
    console.error('Error updating campaign', error)
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
  }

  const campaign = mapCampaign(data as CampaignRow)

  return NextResponse.json({ campaign })
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const rateLimitResponse = applyCampaignsRateLimit(request, 'delete', 20, 60_000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const { id } = context.params

  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'Invalid campaign id' }, { status: 400 })
  }

  let session
  try {
    session = await getSupabaseSession()
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
  }

  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { supabase, userId } = session

  const { error } = await supabase.from('campaigns').delete().eq('id', id).eq('user_id', userId)

  if (error) {
    console.error('Error deleting campaign', error)
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
