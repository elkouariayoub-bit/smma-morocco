import { redirect } from "next/navigation"

export default function LegacyLoginRedirect({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>
}) {
  const params = new URLSearchParams()
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      const normalized = Array.isArray(value) ? value[0] : value
      if (typeof normalized === "string" && normalized.length > 0) {
        params.set(key, normalized)
      }
    }
  }

  const query = params.toString()
  redirect(`/auth/login${query ? `?${query}` : ""}`)
}
