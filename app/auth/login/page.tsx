import type { Metadata } from "next"
import Link from "next/link"
import { Inter } from "next/font/google"

import { LoginForm } from "@/components/auth/LoginForm"
import { ThemeToggle } from "@/components/theme-toggle"
import { sanitizeRedirectPath } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Sign in | SMMA Morocco",
  description: "Securely access the SMMA Morocco platform to manage your agency operations.",
}

type SearchParams = {
  next?: string
  message?: string
}

export default function AuthLoginPage({ searchParams }: { searchParams?: SearchParams }) {
  const nextParam = typeof searchParams?.next === "string" ? searchParams.next : undefined
  const safeNext = sanitizeRedirectPath(nextParam)
  const initialMessage = typeof searchParams?.message === "string" ? searchParams.message : null

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 ${inter.className}`}
    >
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-white transition hover:text-[#0070f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0070f3] text-lg font-bold text-white">
              SM
            </span>
            <span>SMMA Morocco</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-6 py-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-center space-y-8 lg:col-span-5">
            <div className="space-y-4 text-slate-300">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0070f3]">Agency Access</p>
              <h1 className="text-4xl font-bold text-white sm:text-5xl">Secure sign-in for operators</h1>
              <p className="text-base leading-relaxed text-slate-400">
                Authenticate with your email and password or sign in with Google to manage analytics, campaigns, and
                integrations across the SMMA Morocco platform.
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-3 text-sm text-slate-400 sm:grid-cols-2">
              <li className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00c896]" aria-hidden="true" />
                Supabase authentication with encrypted sessions
              </li>
              <li className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0070f3]" aria-hidden="true" />
                Google OAuth powered by Better Auth
              </li>
              <li className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" aria-hidden="true" />
                WCAG 2.2 AA compliant interface
              </li>
              <li className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#9f7aea]" aria-hidden="true" />
                Keyboard-first navigation with visible focus states
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <LoginForm defaultRedirect="/dashboard" nextPath={safeNext} initialMessage={initialMessage} />
          </div>
        </div>
      </main>
    </div>
  )
}
