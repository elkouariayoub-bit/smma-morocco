import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'

import { PageTransition } from '@/components/page-transition'
import { DateRangeProvider } from './providers/date-range'

import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <DateRangeProvider>
          <PageTransition>{children}</PageTransition>
        </DateRangeProvider>
        <Analytics />
      </body>
    </html>
  )
}
