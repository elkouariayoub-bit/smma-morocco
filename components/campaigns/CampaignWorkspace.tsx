'use client'

import { useCallback, useEffect, useMemo, useState, type DragEvent } from 'react'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  MoveVertical,
  Plus,
  Sparkles,
  Trash,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  CAMPAIGN_MILESTONE_STATUS_LABELS,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUSES,
  type CampaignFormInput,
  type CampaignMilestoneStatusOption,
  type CampaignStatusOption,
} from '@/lib/campaigns'
import { getOptionalSupabaseBrowserClient } from '@/lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Campaign, CampaignMilestone, CampaignStatus } from '@/types'
import { useCampaignById, useCampaignStore } from '@/hooks/useCampaignStore'
import { CampaignCreationModal } from './CampaignCreationModal'

import { differenceInCalendarDays, format, isAfter, isBefore, isPast, isFuture, parseISO } from 'date-fns'

type ToastState = {
  message: string
  tone: 'success' | 'error'
}

type ClientOption = { id: string; name: string }

type MilestoneFormState = {
  label: string
  date: string
}

const initialMilestoneForm: MilestoneFormState = {
  label: '',
  date: '',
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `milestone_${Math.random().toString(16).slice(2)}`
}

export function CampaignWorkspace() {
  const campaigns = useCampaignStore((state) => state.campaigns)
  const fetchCampaigns = useCampaignStore((state) => state.fetchCampaigns)
  const createCampaign = useCampaignStore((state) => state.createCampaign)
  const updateCampaign = useCampaignStore((state) => state.updateCampaign)
  const deleteCampaign = useCampaignStore((state) => state.deleteCampaign)
  const reorderCampaigns = useCampaignStore((state) => state.reorderCampaigns)
  const upsertCampaign = useCampaignStore((state) => state.upsertCampaign)
  const removeCampaignFromState = useCampaignStore((state) => state.removeCampaignFromState)
  const selectedId = useCampaignStore((state) => state.selectedId)
  const setSelected = useCampaignStore((state) => state.setSelected)
  const isLoading = useCampaignStore((state) => state.isLoading)
  const isSubmitting = useCampaignStore((state) => state.isSubmitting)
  const error = useCampaignStore((state) => state.error)
  const setError = useCampaignStore((state) => state.setError)

  const selectedCampaign = useCampaignById(selectedId)

  const [statusFilter, setStatusFilter] = useState<'all' | CampaignStatus>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [clientsLoaded, setClientsLoaded] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [previewOrder, setPreviewOrder] = useState<Campaign[] | null>(null)
  const [undoOrder, setUndoOrder] = useState<string[] | null>(null)

  useEffect(() => {
    void fetchCampaigns()
  }, [fetchCampaigns])

  useEffect(() => {
    if (campaigns.length > 0 && (!selectedId || !campaigns.some((campaign) => campaign.id === selectedId))) {
      setSelected(campaigns[0]?.id ?? null)
    }
  }, [campaigns, selectedId, setSelected])

  useEffect(() => {
    if (!clientsLoaded) {
      setClientsLoaded(true)
      void (async () => {
        try {
          const response = await fetch('/api/clients?limit=100')
          if (!response.ok) return
          const payload = await response.json()
          const options = ((payload?.data as Array<{ id: string; name: string }> | undefined) ?? []).map((client) => ({
            id: client.id,
            name: client.name,
          }))
          setClients(options)
        } catch (error) {
          console.warn('Unable to load clients for campaign modal', error)
        }
      })()
    }
  }, [clientsLoaded])

  useEffect(() => {
    if (!toast) {
      return
    }
    const timer = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const supabase = getOptionalSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    const channel = supabase
      .channel('campaigns-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (payload.eventType === 'DELETE') {
            const campaignId = (payload.old as { id?: string }).id
            if (campaignId) {
              removeCampaignFromState(campaignId)
            }
            return
          }

          const campaignId = (payload.new as { id?: string }).id
          if (!campaignId) {
            return
          }

          try {
            const response = await fetch(`/api/campaigns/${campaignId}`)
            if (!response.ok) {
              return
            }
            const data = await response.json()
            if (data?.campaign) {
              upsertCampaign(data.campaign as Campaign)
            }
          } catch (error) {
            console.warn('Failed to refresh campaign from realtime event', error)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [removeCampaignFromState, upsertCampaign])

  const displayedCampaigns = useMemo(() => {
    const source = previewOrder ?? campaigns
    if (statusFilter === 'all') {
      return source
    }
    return source.filter((campaign) => campaign.status === statusFilter)
  }, [campaigns, previewOrder, statusFilter])

  const handleDragStart = useCallback(
    (id: string) => () => {
      setDraggedId(id)
      setPreviewOrder(campaigns)
    },
    [campaigns],
  )

  const handleDragOver = useCallback(
    (id: string) => (event: DragEvent<HTMLButtonElement>) => {
      event.preventDefault()
      if (!draggedId || draggedId === id) {
        return
      }

      const source = previewOrder ?? campaigns
      const draggedIndex = source.findIndex((campaign) => campaign.id === draggedId)
      const targetIndex = source.findIndex((campaign) => campaign.id === id)

      if (draggedIndex === -1 || targetIndex === -1) {
        return
      }

      const next = [...source]
      const [removed] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, removed)
      setPreviewOrder(next)
    },
    [campaigns, draggedId, previewOrder],
  )

  const handleDragEnd = useCallback(() => {
    if (!draggedId) {
      return
    }
    const currentOrder = (previewOrder ?? campaigns).map((campaign) => campaign.id)
    setDraggedId(null)
    setPreviewOrder(null)

    const previousOrder = campaigns.map((campaign) => campaign.id)

    reorderCampaigns(currentOrder).catch((error) => {
      const message = error instanceof Error ? error.message : 'Unable to reorder campaigns'
      setToast({ message, tone: 'error' })
      setUndoOrder(previousOrder)
    })
  }, [campaigns, draggedId, previewOrder, reorderCampaigns])

  const handleUndo = useCallback(() => {
    if (!undoOrder) {
      return
    }
    const order = undoOrder
    setUndoOrder(null)
    reorderCampaigns(order).catch((error) => {
      const message = error instanceof Error ? error.message : 'Unable to restore order'
      setToast({ message, tone: 'error' })
    })
  }, [reorderCampaigns, undoOrder])

  const handleCreateCampaign = useCallback(
    async (values: CampaignFormInput) => {
    const result = await createCampaign(values)
    if (result) {
      setIsModalOpen(false)
      setToast({ message: `${result.name} added to your roadmap`, tone: 'success' })
    } else {
      setToast({ message: 'Unable to create campaign', tone: 'error' })
    }
  },
  [createCampaign],
  )

  const handleStatusChange = useCallback(
    async (campaign: Campaign, status: CampaignStatusOption) => {
      if (campaign.status === status) {
        return
      }
      const updated = await updateCampaign(campaign.id, { status })
      if (updated) {
        setToast({ message: `${updated.name} marked as ${CAMPAIGN_STATUS_LABELS[status].toLowerCase()}`, tone: 'success' })
      } else {
        setToast({ message: 'Unable to update campaign status', tone: 'error' })
      }
    },
    [updateCampaign],
  )

  const handleDeleteCampaign = useCallback(
    async (campaign: Campaign) => {
      const removed = await deleteCampaign(campaign.id)
      if (removed) {
        setToast({ message: `${campaign.name} removed`, tone: 'success' })
      } else {
        setToast({ message: 'Unable to delete campaign', tone: 'error' })
      }
    },
    [deleteCampaign],
  )

  const handleAddMilestone = useCallback(
    async (campaign: Campaign, milestone: MilestoneFormState) => {
      if (!milestone.label.trim() || !milestone.date) {
        return
      }
      const nextMilestones: CampaignMilestone[] = [
        ...campaign.milestones,
        {
          id: generateId(),
          label: milestone.label.trim(),
          date: milestone.date,
          status: 'pending',
        },
      ]
      const updated = await updateCampaign(campaign.id, { milestones: nextMilestones })
      if (updated) {
        setToast({ message: `Milestone added to ${updated.name}`, tone: 'success' })
      } else {
        setToast({ message: 'Unable to add milestone', tone: 'error' })
      }
    },
    [updateCampaign],
  )

  const handleToggleMilestone = useCallback(
    async (campaign: Campaign, milestone: CampaignMilestone) => {
      const nextStatus: CampaignMilestoneStatusOption =
        milestone.status === 'completed' ? 'pending' : 'completed'
      const nextMilestones = campaign.milestones.map((item) =>
        item.id === milestone.id ? { ...item, status: nextStatus } : item,
      )
      const updated = await updateCampaign(campaign.id, { milestones: nextMilestones })
      if (updated) {
        setToast({ message: `${milestone.label} ${nextStatus === 'completed' ? 'completed' : 'reopened'}`, tone: 'success' })
      } else {
        setToast({ message: 'Unable to update milestone', tone: 'error' })
      }
    },
    [updateCampaign],
  )

  const handleUpdateNarrative = useCallback(
    async (campaign: Campaign, description: string) => {
      const updated = await updateCampaign(campaign.id, { description })
      if (updated) {
        setToast({ message: `Updated summary for ${updated.name}`, tone: 'success' })
      } else {
        setToast({ message: 'Unable to update summary', tone: 'error' })
      }
    },
    [updateCampaign],
  )

  const emptyState = !isLoading && campaigns.length === 0

  return (
    <div className="flex flex-col gap-6 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Operations</p>
          <h1 className="text-3xl font-semibold text-white">Campaigns</h1>
          <p className="text-sm text-gray-400">
            Plan, launch, and monitor social campaigns with live progress, timelines, and quick actions.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <span className="text-xs uppercase tracking-[0.2em] text-gray-400">Filter</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | CampaignStatus)}
              className="rounded-full border border-white/10 bg-transparent px-2 py-1 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]"
              aria-label="Filter campaigns by status"
            >
              <option value="all" className="bg-gray-900 text-white">
                All statuses
              </option>
              {CAMPAIGN_STATUSES.map((status) => (
                <option key={status} value={status} className="bg-gray-900 text-white">
                  {CAMPAIGN_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-haspopup="dialog"
            className="h-10 rounded-full bg-[#22c55e] px-4 text-sm font-semibold text-white shadow-lg shadow-[#22c55e]/40 transition hover:bg-[#22c55e]/90"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New campaign
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-3 text-sm text-gray-400">Loading your campaigns…</p>
          <Progress value={65} className="bg-white/10" />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p>{error}</p>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError(null)
                  void fetchCampaigns()
                }}
                className="h-8 rounded-full border border-white/20 px-3 text-xs text-white"
              >
                Retry
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setError(null)}
                className="h-8 rounded-full px-3 text-xs text-white/70"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {undoOrder && (
        <div className="flex items-center justify-between rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <span>We couldn’t reorder the campaigns. Try again?</span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleUndo}
              className="h-8 rounded-full bg-yellow-500/80 px-3 text-xs font-medium text-gray-900 hover:bg-yellow-500"
            >
              Undo
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setUndoOrder(null)}
              className="h-8 rounded-full px-3 text-xs text-yellow-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="flex flex-col gap-4">
          <Card className="rounded-3xl border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Campaign pipeline</h2>
                <p className="text-xs text-gray-400">
                  Drag to reprioritize. Keyboard users can use the “Move to top” shortcuts in the detail view.
                </p>
              </div>
            </header>

            {emptyState ? (
              <div className="relative rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-gray-300">
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />
                <div className="relative flex flex-col gap-3">
                  <p className="text-base font-semibold text-white">Start with a guided plan</p>
                  <p className="text-sm text-gray-400">
                    Create your first campaign to generate an onboarding checklist, launch reminders, and optimization prompts. We
                    recommend mapping three milestones: kickoff, launch, and performance review.
                  </p>
                  <ul className="list-disc pl-5 text-xs text-gray-500">
                    <li>Use the “New campaign” button to open the guided composer.</li>
                    <li>Assign a client to sync campaign performance with their profile.</li>
                    <li>Milestones can be reordered or toggled as work progresses.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <ul role="list" className="flex flex-col gap-2">
                {displayedCampaigns.map((campaign) => {
                  const isActive = selectedId === campaign.id
                  const statusLabel = CAMPAIGN_STATUS_LABELS[campaign.status]
                  return (
                    <li key={campaign.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(campaign.id)}
                        onDragStart={handleDragStart(campaign.id)}
                        onDragOver={handleDragOver(campaign.id)}
                        onDragEnd={handleDragEnd}
                        draggable={statusFilter === 'all'}
                        className={`group flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? 'border-[#22c55e]/60 bg-[#22c55e]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                        }`}
                        aria-pressed={isActive}
                      >
                        <div className="flex flex-1 items-center gap-3">
                          <MoveVertical className="h-4 w-4 text-gray-500 transition group-hover:text-white" aria-hidden="true" />
                          <div>
                            <p className="text-sm font-semibold text-white">{campaign.name}</p>
                            <p className="text-xs text-gray-400">
                              {campaign.client_name ? `Client: ${campaign.client_name}` : 'Unassigned'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(campaign.status)}`}
                          >
                            {statusLabel}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-500 transition group-hover:text-white" aria-hidden="true" />
                        </div>
                      </button>
                    </li>
                  )
                })}

                {displayedCampaigns.length === 0 && !emptyState && (
                  <li className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-gray-400">
                    No campaigns match this filter. Try switching back to “All statuses”.
                  </li>
                )}
              </ul>
            )}
          </Card>

          <Card className="rounded-3xl border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Quick actions</h2>
                <p className="text-xs text-gray-400">Kick off planning rituals or share updates with clients.</p>
              </div>
            </header>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickActionCard
                title="Share kickoff agenda"
                description="Send your client the onboarding checklist and timeline."
                onClick={() =>
                  selectedCampaign
                    ? setToast({ message: `Shared kickoff notes for ${selectedCampaign.name}`, tone: 'success' })
                    : setToast({ message: 'Select a campaign to share notes', tone: 'error' })
                }
              />
              <QuickActionCard
                title="Schedule reporting"
                description="Block calendar time for the next performance review."
                onClick={() =>
                  selectedCampaign
                    ? setToast({ message: `Reporting slot reserved for ${selectedCampaign.name}`, tone: 'success' })
                    : setToast({ message: 'Select a campaign to schedule reporting', tone: 'error' })
                }
              />
              <QuickActionCard
                title="Duplicate playbook"
                description="Reuse this plan for another client with similar goals."
                onClick={() => setToast({ message: 'Playbook duplicated as a draft', tone: 'success' })}
              />
              <QuickActionCard
                title="Export timeline"
                description="Download milestones to share in weekly stand-ups."
                onClick={() => setToast({ message: 'Timeline exported as CSV', tone: 'success' })}
              />
            </div>
          </Card>
        </section>

        <section>
          {selectedCampaign ? (
            <CampaignDetailPanel
              campaign={selectedCampaign}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteCampaign}
              onAddMilestone={handleAddMilestone}
              onToggleMilestone={handleToggleMilestone}
              onUpdateNarrative={handleUpdateNarrative}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-gray-400">
              <Sparkles className="mb-4 h-10 w-10 text-[#22c55e]" aria-hidden="true" />
              <p>Select a campaign to review milestones, update status, and share notes.</p>
            </div>
          )}
        </section>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 rounded-2xl border px-4 py-3 text-sm shadow-xl transition ${
            toast.tone === 'success'
              ? 'border-[#22c55e]/40 bg-[#22c55e]/15 text-[#22c55e]'
              : 'border-red-500/40 bg-red-500/15 text-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      <CampaignCreationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCampaign}
        isSubmitting={isSubmitting}
        errorMessage={null}
        clients={clients}
      />
    </div>
  )
}

type CampaignDetailProps = {
  campaign: Campaign
  onStatusChange: (campaign: Campaign, status: CampaignStatusOption) => Promise<void>
  onDelete: (campaign: Campaign) => Promise<void>
  onAddMilestone: (campaign: Campaign, milestone: MilestoneFormState) => Promise<void>
  onToggleMilestone: (campaign: Campaign, milestone: CampaignMilestone) => Promise<void>
  onUpdateNarrative: (campaign: Campaign, description: string) => Promise<void>
  isSubmitting: boolean
}

function CampaignDetailPanel({
  campaign,
  onStatusChange,
  onDelete,
  onAddMilestone,
  onToggleMilestone,
  onUpdateNarrative,
  isSubmitting,
}: CampaignDetailProps) {
  const [formState, setFormState] = useState<MilestoneFormState>(initialMilestoneForm)
  const [description, setDescription] = useState(campaign.description ?? '')
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  useEffect(() => {
    setDescription(campaign.description ?? '')
  }, [campaign.description])

  const formattedStart = format(parseISO(campaign.startDate), 'MMM d, yyyy')
  const formattedEnd = campaign.endDate ? format(parseISO(campaign.endDate), 'MMM d, yyyy') : 'Not scheduled'

  const upcomingMilestones = campaign.milestones.filter((milestone) => milestone.status !== 'completed')
  const nextMilestone = upcomingMilestones.sort((a, b) => {
    const left = parseISO(a.date)
    const right = parseISO(b.date)
    if (isBefore(left, right)) return -1
    if (isAfter(left, right)) return 1
    return 0
  })[0]

  const daysUntilNext = nextMilestone ? differenceInCalendarDays(parseISO(nextMilestone.date), new Date()) : null

  return (
    <Card className="flex h-full flex-col gap-6 rounded-3xl border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{campaign.name}</h2>
            <p className="text-sm text-gray-400">
              {campaign.client_name ? `Client: ${campaign.client_name}` : 'No client assigned yet'}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(campaign.status)}`}>
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Kickoff {formattedStart}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {campaign.endDate ? `Wrap-up ${formattedEnd}` : 'Wrap-up TBD'}
          </span>
          {typeof campaign.metadata?.geo === 'string' && campaign.metadata.geo && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {String(campaign.metadata.geo)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={campaign.status}
            onChange={(event) => void onStatusChange(campaign, event.target.value as CampaignStatusOption)}
            className="h-9 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]"
          >
            {CAMPAIGN_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-gray-900 text-white">
                {CAMPAIGN_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={() => void onStatusChange(campaign, 'completed')}
            disabled={campaign.status === 'completed' || isSubmitting}
            className="h-9 rounded-full bg-[#22c55e] px-4 text-xs font-semibold text-white shadow-[#22c55e]/30 transition hover:bg-[#22c55e]/90 disabled:opacity-60"
          >
            Mark complete
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => void onDelete(campaign)}
            disabled={isSubmitting}
            className="h-9 rounded-full px-4 text-xs text-red-300 hover:text-red-200"
          >
            <Trash className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Campaign summary</h3>
          {!isEditingDescription ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditingDescription(true)}
              className="h-8 rounded-full px-3 text-xs text-[#22c55e] hover:text-[#1ca34d]"
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditingDescription(false)
                  setDescription(campaign.description ?? '')
                }}
                className="h-8 rounded-full px-3 text-xs text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  void onUpdateNarrative(campaign, description)
                  setIsEditingDescription(false)
                }}
                disabled={isSubmitting}
                className="h-8 rounded-full bg-[#22c55e] px-3 text-xs font-semibold text-white hover:bg-[#22c55e]/90"
              >
                Save
              </Button>
            </div>
          )}
        </div>
        {isEditingDescription ? (
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[140px] rounded-2xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 focus-visible:border-[#22c55e] focus-visible:ring-4 focus-visible:ring-[#22c55e]/30"
            placeholder="Outline the creative angle, campaign promise, and any paid budget."
          />
        ) : (
          <p className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-gray-300">
            {campaign.description ? campaign.description : 'Add context so collaborators understand the plan.'}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Milestones</h3>
          {nextMilestone && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-gray-300">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {daysUntilNext != null
                ? daysUntilNext > 0
                  ? `${daysUntilNext} days until ${nextMilestone.label}`
                  : `Due today: ${nextMilestone.label}`
                : 'Next milestone scheduled'}
            </span>
          )}
        </div>

        <CampaignTimeline
          milestones={campaign.milestones}
          onToggle={(milestone) => void onToggleMilestone(campaign, milestone)}
        />

        <form
          className="flex flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4"
          onSubmit={(event) => {
            event.preventDefault()
            void onAddMilestone(campaign, formState)
            setFormState(initialMilestoneForm)
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Add milestone</p>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <Input
              value={formState.label}
              onChange={(event) => setFormState((prev) => ({ ...prev, label: event.target.value }))}
              placeholder="e.g. Launch Meta ads"
              className="h-10 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 focus-visible:border-[#22c55e] focus-visible:ring-4 focus-visible:ring-[#22c55e]/30"
              aria-label="Milestone label"
            />
            <Input
              value={formState.date}
              onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
              type="date"
              className="h-10 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus-visible:border-[#22c55e] focus-visible:ring-4 focus-visible:ring-[#22c55e]/30"
              aria-label="Milestone date"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!formState.label || !formState.date || isSubmitting}
              className="h-9 rounded-full bg-[#22c55e] px-4 text-xs font-semibold text-white hover:bg-[#22c55e]/90"
            >
              Add milestone
            </Button>
          </div>
        </form>
      </section>
    </Card>
  )
}

type CampaignTimelineProps = {
  milestones: CampaignMilestone[]
  onToggle: (milestone: CampaignMilestone) => void
}

function CampaignTimeline({ milestones, onToggle }: CampaignTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
        No milestones yet. Add your kickoff, launch, and performance reviews to stay on track.
      </div>
    )
  }

  return (
    <ol className="space-y-4">
      {milestones
        .slice()
        .sort((a, b) => (isBefore(parseISO(a.date), parseISO(b.date)) ? -1 : 1))
        .map((milestone) => {
          const statusLabel = CAMPAIGN_MILESTONE_STATUS_LABELS[milestone.status]
          const formatted = format(parseISO(milestone.date), 'MMM d, yyyy')
          const upcoming = isFuture(parseISO(milestone.date))
          const overdue = isPast(parseISO(milestone.date)) && milestone.status !== 'completed'

          return (
            <li key={milestone.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StatusIcon status={milestone.status} />
                  <div>
                    <p className="text-sm font-semibold text-white">{milestone.label}</p>
                    <p className="text-xs text-gray-400">
                      {formatted} · {statusLabel}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onToggle(milestone)}
                  className="h-8 rounded-full border border-white/20 px-3 text-xs text-white"
                >
                  {milestone.status === 'completed' ? 'Reopen' : 'Mark complete'}
                </Button>
              </div>
              {overdue && (
                <p className="mt-2 text-xs text-red-300">This milestone is overdue. Update the schedule or mark it complete.</p>
              )}
              {upcoming && milestone.status !== 'completed' && (
                <p className="mt-2 text-xs text-gray-400">Coming up soon—prep assets and assign owners.</p>
              )}
            </li>
          )
        })}
    </ol>
  )
}

type QuickActionCardProps = {
  title: string
  description: string
  onClick: () => void
}

function QuickActionCard({ title, description, onClick }: QuickActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-gray-300 transition hover:border-white/30 hover:bg-white/10"
    >
      <span className="text-sm font-semibold text-white">{title}</span>
      <span className="text-xs text-gray-400">{description}</span>
    </button>
  )
}

function StatusIcon({ status }: { status: CampaignMilestone['status'] }) {
  if (status === 'completed') {
    return <CheckCircle2 className="h-4 w-4 text-[#22c55e]" aria-hidden="true" />
  }
  if (status === 'in_progress') {
    return <Loader2 className="h-4 w-4 animate-spin text-sky-300" aria-hidden="true" />
  }
  return <Sparkles className="h-4 w-4 text-gray-300" aria-hidden="true" />
}

function getStatusBadgeClass(status: CampaignStatus) {
  switch (status) {
    case 'completed':
      return 'bg-[#22c55e]/20 text-[#22c55e]'
    case 'active':
      return 'bg-sky-500/20 text-sky-300'
    case 'paused':
      return 'bg-yellow-500/20 text-yellow-200'
    case 'archived':
      return 'bg-gray-600/30 text-gray-300'
    default:
      return 'bg-white/10 text-gray-200'
  }
}
