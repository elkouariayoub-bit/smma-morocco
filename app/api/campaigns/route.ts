import { NextRequest, NextResponse } from 'next/server'

import {
  mapCampaign,
  normalizeCampaignDate,
  normalizeCampaignMilestones,
  parseCampaignForm,
  parseCampaignQuery,
  parseCampaignReorder,
  type CampaignRow,
  ZodError,
} from '@/lib/campaigns'

import { applyCampaignsRateLimit, getSupabaseSession } from './utils'

export async function GET(request: NextRequest) {
  const rateLimitResponse = applyCampaignsRateLimit(request, 'list', 60, 60_000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const { searchParams } = new URL(request.url)

  let query
  try {
    query = parseCampaignQuery({
      clientId: searchParams.get('clientId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid query parameters' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
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

  let statement = supabase
    .from('campaigns')
    .select(
      'id, user_id, client_id, name, description, status, start_date, end_date, position, milestones, metadata, created_at, updated_at, clients(name)',
    )
    .eq('user_id', userId)
    .order('position', { ascending: true })

  if (query.clientId) {
    statement = statement.eq('client_id', query.clientId)
  }
  if (query.status) {
    statement = statement.eq('status', query.status)
  }
  if (query.from) {
    statement = statement.gte('start_date', query.from)
  }
  if (query.to) {
    statement = statement.lte('start_date', query.to)
  }

  const { data, error } = await statement

  if (error) {
    console.error('Error fetching campaigns', error)
    return NextResponse.json({ error: 'Unable to load campaigns' }, { status: 500 })
  }

  const campaigns = (data ?? []).map((row) => mapCampaign(row as CampaignRow))

  return NextResponse.json({ data: campaigns })
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = applyCampaignsRateLimit(request, 'create', 20, 60_000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  let payload
  try {
    const body = await request.json()
    payload = parseCampaignForm(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request payload' }, { status: 422 })
    }
    console.error('Invalid campaign request payload', error)
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

  const normalizedStart = normalizeCampaignDate(payload.startDate)
  const normalizedEnd = payload.endDate ? normalizeCampaignDate(payload.endDate) : null
  const normalizedMilestones = normalizeCampaignMilestones(payload.milestones, {
    startDate: normalizedStart,
    endDate: normalizedEnd,
  })

  const { data: positionRows, error: positionError } = await supabase
    .from('campaigns')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1)

  if (positionError) {
    console.error('Unable to determine next campaign position', positionError)
    return NextResponse.json({ error: 'Unable to create campaign' }, { status: 500 })
  }

  const nextPosition = (positionRows?.[0]?.position ?? 0) + 1

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      user_id: userId,
      client_id: payload.clientId ?? null,
      name: payload.name,
      description: payload.description ?? null,
      status: payload.status,
      start_date: normalizedStart,
      end_date: normalizedEnd,
      position: nextPosition,
      milestones: normalizedMilestones,
    })
    .select(
      'id, user_id, client_id, name, description, status, start_date, end_date, position, milestones, metadata, created_at, updated_at, clients(name)',
    )
    .single()

  if (error || !data) {
    console.error('Error creating campaign', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }

  const campaign = mapCampaign(data as CampaignRow)

  return NextResponse.json({ campaign }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const rateLimitResponse = applyCampaignsRateLimit(request, 'reorder', 20, 60_000)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  let payload
  try {
    const body = await request.json()
    payload = parseCampaignReorder(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid reorder payload' }, { status: 422 })
    }
    return NextResponse.json({ error: 'Invalid reorder payload' }, { status: 400 })
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

  for (const [index, id] of payload.order.entries()) {
    const { error } = await supabase
      .from('campaigns')
      .update({ position: index + 1 })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to update campaign order', error)
      return NextResponse.json({ error: 'Unable to reorder campaigns' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
