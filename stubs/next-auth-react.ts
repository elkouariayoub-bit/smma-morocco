export type Session = import('./next-auth').Session

export function useSession(): { data: Session; status: 'authenticated' | 'unauthenticated' | 'loading' } {
  return { data: null, status: 'unauthenticated' }
}

export async function signIn(_provider?: string, _options?: Record<string, unknown>) {
  return { ok: false, error: 'not-implemented' }
}

export async function signOut(_options?: Record<string, unknown>) {
  return { ok: true }
}
