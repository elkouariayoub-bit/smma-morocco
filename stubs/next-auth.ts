export type Session = {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  expires?: string
} | null

export type NextAuthOptions = Record<string, unknown>

export async function getServerSession(): Promise<Session> {
  return null
}

export default function NextAuth(_options?: NextAuthOptions) {
  return {}
}
