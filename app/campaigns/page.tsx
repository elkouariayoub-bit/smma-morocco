import { Suspense } from 'react'

import { DashboardShell } from '@/components/dashboard-shell'
import { CampaignWorkspace } from '@/components/campaigns/CampaignWorkspace'

export const metadata = {
  title: 'Campaigns',
  description: 'Create, monitor, and optimize social campaigns with live timelines and actionable status updates.',
}

export default function CampaignsPage() {
  return (
    <DashboardShell redirectPath="/campaigns">
      <Suspense fallback={<div className="text-sm text-gray-400">Loading campaigns…</div>}>
        <CampaignWorkspace />
      </Suspense>
    </DashboardShell>
  )
}
