import { NextRequest, NextResponse } from 'next/server'

import type { PostgrestError } from '@supabase/supabase-js'
import { decryptContact, encryptContact, mapClient, parseClientForm, ZodError } from '@/lib/clients'

import { applyClientsRateLimit, getSupabaseSession, withSupabaseCookies } from '../utils'

type RouteContext = { params: { id?: string } }

function validateId(id: string | undefined) {
  return typeof id === 'string' && id.length > 0
}

function isForbidden(error: PostgrestError | null) {
  if (!error) {
    return false
  }

  const code = error.code?.toUpperCase()
  if (!code) {
    return error.message.toLowerCase().includes('permission denied')
  }

  return code === '42501' || code === 'PGRST301' || code === 'PGRST302' || code === 'PGRST303'
}

export async function GET(request: NextRequest, context: RouteContext) {
  const rateLimitResponse = applyClientsRateLimit(request, 'detail', 60)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  if (!validateId(context.params.id)) {
    return NextResponse.json({ error: 'Invalid client identifier' }, { status: 400 })
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
  const { data, error } = await supabase
    .from('clients')
    .select('id, user_id, name, contact_encrypted, status, metadata, created_at, updated_at')
    .eq('user_id', userId)
    .eq('id', context.params.id!)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error loading client', error)
    if (isForbidden(error)) {
      return withSupabaseCookies(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        session.response,
      )
    }
    return withSupabaseCookies(
      NextResponse.json({ error: 'Unable to load client' }, { status: 500 }),
      session.response,
    )
  }

  if (!data) {
    return withSupabaseCookies(
      NextResponse.json({ error: 'Client not found' }, { status: 404 }),
      session.response,
    )
  }

  const contact = decryptContact(data.contact_encrypted)
  return withSupabaseCookies(NextResponse.json({ client: mapClient(data, contact) }), session.response)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const rateLimitResponse = applyClientsRateLimit(request, 'update')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  if (!validateId(context.params.id)) {
    return NextResponse.json({ error: 'Invalid client identifier' }, { status: 400 })
  }

  let payload
  try {
    const body = await request.json()
    payload = parseClientForm(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request payload' }, { status: 422 })
    }
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
    .update({
      name: payload.name,
      contact_encrypted: encryptedContact,
      status: payload.status,
    })
    .eq('user_id', userId)
    .eq('id', context.params.id!)
    .select('id, user_id, name, contact_encrypted, status, metadata, created_at, updated_at')
    .single()

  if (error) {
    console.error('Error updating client', error)
    if (isForbidden(error)) {
      return withSupabaseCookies(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        session.response,
      )
    }
    return withSupabaseCookies(
      NextResponse.json({ error: 'Failed to update client' }, { status: 500 }),
      session.response,
    )
  }

  const contact = decryptContact(data.contact_encrypted)
  return withSupabaseCookies(NextResponse.json({ client: mapClient(data, contact) }), session.response)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const rateLimitResponse = applyClientsRateLimit(request, 'delete')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  if (!validateId(context.params.id)) {
    return NextResponse.json({ error: 'Invalid client identifier' }, { status: 400 })
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
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('user_id', userId)
    .eq('id', context.params.id!)

  if (error) {
    console.error('Error deleting client', error)
    if (isForbidden(error)) {
      return withSupabaseCookies(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        session.response,
      )
    }
    return withSupabaseCookies(
      NextResponse.json({ error: 'Failed to delete client' }, { status: 500 }),
      session.response,
    )
  }

  return withSupabaseCookies(NextResponse.json({ success: true }), session.response)
}
