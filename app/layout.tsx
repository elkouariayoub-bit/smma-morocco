import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'

import { PageTransition } from '@/components/page-transition'
import { DateRangeProvider } from './providers/date-range'
import { GoalsProvider } from '@/app/providers/goals'
import { ThemeProvider } from '@/components/theme-provider'
import { createClient } from '@/lib/supabase'
import { SupabaseSessionProvider } from '@/app/providers/supabase-session'

import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

async function resolveInitialSession(): Promise<Session | null> {
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session ?? null
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase session could not be prefetched:', error)
    }

    return null
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const initialSession = await resolveInitialSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <ThemeProvider>
          <SupabaseSessionProvider initialSession={initialSession}>
            <GoalsProvider>
              <DateRangeProvider>
                <PageTransition>{children}</PageTransition>
              </DateRangeProvider>
            </GoalsProvider>
          </SupabaseSessionProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
