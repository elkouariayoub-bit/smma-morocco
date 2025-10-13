import { buildDefaultReportFilters, getReportPreview } from '@/lib/reports'
import { createClient } from '@/lib/supabase'
import { ReportsClient } from './reports-client'

export default async function ReportsPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const defaultFilters = buildDefaultReportFilters()
  const preview = await getReportPreview(defaultFilters, { userId: session?.user?.id })

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#fbbf24]">Reports</p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Campaign performance</h1>
        <p className="text-sm text-muted-foreground">
          Generate export-ready insights across campaigns, clients, and channels. Filter the reporting window and download CSV,
          PDF, or Excel summaries in seconds.
        </p>
      </header>

      <ReportsClient initialPreview={preview} />
    </div>
  )
}
