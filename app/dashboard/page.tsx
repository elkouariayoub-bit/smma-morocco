import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

import { DashboardClient } from './dashboard-client'
import { buildFilterRange, getDashboardMetrics, recordDashboardEvent } from '@/lib/metrics'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const defaultRange = buildFilterRange('last_7_days')
  const metrics = await getDashboardMetrics({ from: defaultRange.from, to: defaultRange.to })

  if (session?.user?.id) {
    await recordDashboardEvent('dashboard_view', { preset: defaultRange.preset }, session.user.id)
  }

  return (
    <main className="space-y-8">
      <DashboardClient initialMetrics={metrics} initialFilter={defaultRange.preset} />
    </main>
  )
}
