import { useCallback, useEffect, useMemo, useState } from 'react'

import { getOptionalSupabaseBrowserClient } from '@/lib/supabase'
import type { UserIntegration } from '@/types'

export type IntegrationPlatform = 'meta' | 'x' | 'tiktok'

export type IntegrationCredentials = Partial<
  Pick<UserIntegration, 'api_key' | 'api_secret' | 'access_token' | 'refresh_token'>
> & {
  metadata?: Record<string, unknown>
  expires_at?: string | null
}

type OperationResult = {
  success: boolean
  message?: string
  integration?: UserIntegration | null
}

export function useIntegration(platform: IntegrationPlatform) {
  const supabaseClient = useMemo(() => getOptionalSupabaseBrowserClient(), [])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [integration, setIntegration] = useState<UserIntegration | null>(null)

  const ensureSession = useCallback(async () => {
    if (!supabaseClient) {
      throw new Error('Supabase is not configured. Please sign in again later.')
    }

    const { data, error } = await supabaseClient.auth.getSession()
    if (error) {
      throw new Error(error.message || 'Unable to verify authentication.')
    }

    if (!data.session) {
      throw new Error('You must be signed in to manage integrations.')
    }

    return data.session
  }, [supabaseClient])

  const fetchStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await ensureSession()

      const response = await fetch(`/api/integrations/${platform}`)
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to load integration.')
      }

      const payload = (await response.json()) as { integration: UserIntegration | null }
      const nextIntegration = payload.integration ?? null
      setIntegration(nextIntegration)
      setIsConnected(Boolean(nextIntegration?.is_connected))

      return { success: true, integration: nextIntegration } satisfies OperationResult
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Failed to load integration.'
      setIsConnected(false)
      setIntegration(null)
      setError(message)
      return { success: false, message } satisfies OperationResult
    } finally {
      setIsLoading(false)
    }
  }, [ensureSession, platform])

  const testConnection = useCallback(
    async (credentials: IntegrationCredentials) => {
      setIsLoading(true)
      setError(null)

      try {
        await ensureSession()

        const response = await fetch(`/api/integrations/${platform}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        })

        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          const message = payload.error || payload.message || 'Unable to test credentials.'
          throw new Error(message)
        }

        return { success: Boolean(payload.success), message: payload.message } satisfies OperationResult
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Unable to test credentials.'
        setError(message)
        return { success: false, message } satisfies OperationResult
      } finally {
        setIsLoading(false)
      }
    },
    [ensureSession, platform],
  )

  const connect = useCallback(
    async (credentials: IntegrationCredentials) => {
      setIsLoading(true)
      setError(null)

      try {
        await ensureSession()

        const response = await fetch(`/api/integrations/${platform}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'Unable to connect integration.')
        }

        const payload = (await response.json()) as { integration: UserIntegration | null }
        const nextIntegration = payload.integration ?? null
        setIntegration(nextIntegration)
        setIsConnected(Boolean(nextIntegration?.is_connected))

        return { success: true, integration: nextIntegration } satisfies OperationResult
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Unable to connect integration.'
        setError(message)
        return { success: false, message } satisfies OperationResult
      } finally {
        setIsLoading(false)
      }
    },
    [ensureSession, platform],
  )

  const disconnect = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await ensureSession()

      const response = await fetch(`/api/integrations/${platform}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || 'Unable to disconnect integration.')
      }

      setIntegration(null)
      setIsConnected(false)
      return { success: true, integration: null } satisfies OperationResult
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to disconnect integration.'
      setError(message)
      return { success: false, message } satisfies OperationResult
    } finally {
      setIsLoading(false)
    }
  }, [ensureSession, platform])

  useEffect(() => {
    void fetchStatus()
  }, [fetchStatus])

  return {
    integration,
    isConnected,
    isLoading,
    error,
    fetchStatus,
    testConnection,
    connect,
    disconnect,
  }
}
