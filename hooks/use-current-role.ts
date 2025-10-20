'use client'

import { useMemo } from 'react'

export type Role = 'owner' | 'admin' | 'editor'

/**
 * TODO: Replace this mock with an authenticated call to fetch the viewer's real role.
 */
export function useCurrentRole(): Role {
  return useMemo(() => 'owner', [])
}
