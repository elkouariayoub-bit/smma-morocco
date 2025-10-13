import { NextRequest, NextResponse } from 'next/server'

import type { PostgrestError } from '@supabase/supabase-js'
import { decryptContact, encryptContact, mapClient, parseClientForm, parseClientQuery, ZodError } from '@/lib/clients'

import { applyClientsRateLimit, getSupabaseSession, withSupabaseCookies } from './utils'

function isForbidden(error: PostgrestError | null): boolean {
  if (!error) {
    return false
  }

  const code = error.code?.toUpperCase()
  if (!code) {
    return error.message.toLowerCase().includes('permission denied')
  }

  return code === '42501' || code === 'PGRST301' || code === 'PGRST302' || code === 'PGRST303'
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = applyClientsRateLimit(request, 'list')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const { searchParams } = new URL(request.url)

  let query
  try {
    query = parseClientQuery({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid query parameters' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  let session
  try {
    session = await getSupabaseSession(request)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
  }

  if (!session.userId) {
    return withSupabaseCookies(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session.response,
    )
  }

  const { supabase, userId } = session
  const offset = (query.page - 1) * query.limit
  const rangeEnd = offset + query.limit - 1

  let statement = supabase
    .from('clients')
    .select('id, user_id, name, contact_encrypted, status, metadata, created_at, updated_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, rangeEnd)

  if (query.search) {
    statement = statement.ilike('name', `%${query.search}%`)
  }

  const { data, error, count } = await statement

  if (error) {
    console.error('Error fetching clients', error)
    if (isForbidden(error)) {
      return withSupabaseCookies(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        session.response,
      )
    }
    return withSupabaseCookies(
      NextResponse.json({ error: 'Unable to load clients' }, { status: 500 }),
      session.response,
    )
  }

  const clients = (data ?? []).map((row) => {
    const contact = decryptContact(row.contact_encrypted)
    return mapClient(row, contact)
  })

  return withSupabaseCookies(
    NextResponse.json({ data: clients, total: count ?? clients.length, page: query.page, limit: query.limit }),
    session.response,
  )
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = applyClientsRateLimit(request, 'create')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  let payload
  try {
    const body = await request.json()
    payload = parseClientForm(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request payload' }, { status: 422 })
    }

    console.error('Invalid client request payload', error)
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  let session
  try {
    session = await getSupabaseSession(request)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
  }

  if (!session.userId) {
    return withSupabaseCookies(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session.response,
    )
  }

  const { supabase, userId } = session

  let encryptedContact: string
  try {
    encryptedContact = encryptContact(payload.contact)
  } catch (error) {
    return NextResponse.json({ error: 'Unable to process credentials securely' }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: userId,
      name: payload.name,
      contact_encrypted: encryptedContact,
      status: payload.status,
    })
    .select('id, user_id, name, contact_encrypted, status, metadata, created_at, updated_at')
    .single()

  if (error || !data) {
    console.error('Error creating client', error)
    if (isForbidden(error ?? null)) {
      return withSupabaseCookies(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        session.response,
      )
    }
    return withSupabaseCookies(
      NextResponse.json({ error: 'Failed to create client' }, { status: 500 }),
      session.response,
    )
  }

  const contact = decryptContact(data.contact_encrypted)
  const client = mapClient(data, contact)

  return withSupabaseCookies(NextResponse.json({ client }, { status: 201 }), session.response)
}
