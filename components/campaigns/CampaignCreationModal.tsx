'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUSES,
  type CampaignFormInput,
} from '@/lib/campaigns'

type CampaignCreationModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (values: CampaignFormInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage?: string | null
  clients: Array<{ id: string; name: string }>
}

const DEFAULT_VALUES: CampaignFormInput = {
  name: '',
  clientId: null,
  status: 'planned',
  startDate: '',
  endDate: undefined,
  description: '',
  milestones: [],
}

export function CampaignCreationModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
  clients,
}: CampaignCreationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isValid, isSubmitting: formSubmitting },
  } = useForm<CampaignFormInput>({
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  })

  const clientValue = watch('clientId')
  const statusValue = watch('status')
  const endDateValue = watch('endDate')
  const descriptionValue = watch('description')
  const nameValue = watch('name')
  const startDateValue = watch('startDate')

  const nameField = register('name', {
    required: 'Campaign name is required',
    minLength: { value: 3, message: 'Name must contain at least 3 characters' },
  })
  const startDateField = register('startDate', {
    required: 'Start date is required',
  })
  const clientField = register('clientId')
  const statusField = register('status')
  const endDateField = register('endDate')
  const descriptionField = register('description')

  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES)
    }
  }, [open, reset])

  if (!open) {
    return null
  }

  const submitting = isSubmitting || formSubmitting

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-xl animate-in fade-in zoom-in rounded-3xl border border-white/10 bg-gray-900/95 text-white shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between rounded-3xl rounded-b-none border-b border-white/10 bg-gray-900/90 px-6 py-5">
          <div>
            <h2 id="campaign-modal-title" className="text-xl font-semibold text-white">
              Create campaign
            </h2>
            <p className="text-sm text-gray-400">
              Define your campaign timeline, assign a client, and align the launch plan with the dashboard metrics.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/70"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form
          className="space-y-5 px-6 pb-6 pt-5"
          onSubmit={handleSubmit(async (values) => {
            if (values.endDate && values.startDate && values.endDate < values.startDate) {
              setError('endDate', { type: 'manual', message: 'Wrap-up date must be after the kickoff date' })
              return
            }

            if (values.description && values.description.length > 1000) {
              setError('description', {
                type: 'manual',
                message: 'Summary should be under 1,000 characters',
              })
              return
            }

            clearErrors('endDate')
            clearErrors('description')

            const payload: CampaignFormInput = {
              ...values,
              clientId: values.clientId ?? null,
              endDate: values.endDate || undefined,
              milestones: values.milestones ?? [],
            }
            await onSubmit(payload)
          })}
        >
          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {errorMessage}
            </div>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <label htmlFor="campaign-name" className="text-sm font-medium text-gray-200">
                Campaign name
              </label>
              <Input
                id="campaign-name"
                placeholder="Fall Awareness Push"
                name={nameField.name}
                value={nameValue ?? ''}
                onChange={nameField.onChange}
                onBlur={nameField.onBlur}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'campaign-name-error' : undefined}
                className="h-11 rounded-xl border border-white/10 bg-white/5 text-base text-white placeholder:text-gray-500 focus-visible:border-[#22c55e] focus-visible:ring-4 focus-visible:ring-[#22c55e]/30"
              />
              {errors.name?.message && (
                <p id="campaign-name-error" className="text-sm text-red-300">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="campaign-client" className="text-sm font-medium text-gray-200">
                Client (optional)
              </label>
              <select
                name={clientField.name}
                id="campaign-client"
                value={clientValue ?? ''}
                onChange={(event) => {
                  const nextValue = event.target.value ? event.target.value : null
                  clientField.onChange({ target: { value: nextValue } })
                }}
                onBlur={clientField.onBlur}
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white focus-visible:border-[#22c55e] focus-visible:ring-4 focus-visible:ring-[#22c55e]/30"
              >
                <option value="" className="bg-gray-900 text-white">
                  Unassigned
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="bg-gray-900 text-white">
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="campaign-start" className="text-sm font-medium text-gray-200">
                  Kickoff date
                </label>
                <Input
                  id="campaign-start"
                  type="date"
                  placeholder="YYYY-MM-DD"
                  name={startDateField.name}
                  value={startDateValue ?? ''}
                  onChange={startDateField.onChange}
                  onBlur={startDateField.onBlur}
                  aria-invalid={Boolean(errors.startDate)}
                  aria-describedby={errors.startDate ? 'campaign-start-error' : undefined}
                  className="h-11 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 focus-visible:border-[#22c55e] focus-visible:ring-4 focus-visible:ring-[#22c55e]/30"
                />
                {errors.startDate?.message && (
                  <p id="campaign-start-error" className="text-sm text-red-300">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="campaign-end" className="text-sm font-medium text-gray-200">
                  Wrap-up date
                </label>
                <Input
                  id="campaign-end"
                  type="date"
                  placeholder="YYYY-MM-DD"
                  name={endDateField.name}
                  value={endDateValue ?? ''}
                  onChange={(event) => {
                    const nextValue = event.target.value ? event.target.value : ''
                    endDateField.onChange({ target: { value: nextValue } })
                    clearErrors('endDate')
                  }}
                  onBlur={endDateField.onBlur}
                  aria-invalid={Boolean(errors.endDate)}
                  aria-describedby={errors.endDate ? 'campaign-end-error' : undefined}
                  className="h-11 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 focus-visible:border-[#22c55e] focus-visible:ring-4 focus-visible:ring-[#22c55e]/30"
                />
                {errors.endDate?.message && (
                  <p id="campaign-end-error" className="text-sm text-red-300">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="campaign-status" className="text-sm font-medium text-gray-200">
                Status
              </label>
              <select
                name={statusField.name}
                id="campaign-status"
                value={statusValue ?? 'planned'}
                onChange={(event) => {
                  statusField.onChange({ target: { value: event.target.value } })
                }}
                onBlur={statusField.onBlur}
                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white focus-visible:border-[#22c55e] focus-visible:ring-4 focus-visible:ring-[#22c55e]/30"
              >
                {CAMPAIGN_STATUSES.map((status) => (
                  <option key={status} value={status} className="bg-gray-900 text-white">
                    {CAMPAIGN_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="campaign-description" className="text-sm font-medium text-gray-200">
                Summary
              </label>
              <Textarea
                id="campaign-description"
                name={descriptionField.name}
                value={descriptionValue ?? ''}
                onChange={(event) => {
                  descriptionField.onChange(event)
                  clearErrors('description')
                }}
                onBlur={descriptionField.onBlur}
                rows={4}
                placeholder="Outline your creative angle, paid media mix, or key deliverables."
                className="min-h-[120px] rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 focus-visible:border-[#22c55e] focus-visible:ring-4 focus-visible:ring-[#22c55e]/30"
              />
              {errors.description?.message && (
                <p className="text-sm text-red-300">{errors.description.message}</p>
              )}
              <p className="text-xs text-gray-500">
                We automatically generate kickoff, launch, and performance milestones. You can fine-tune them after creation.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-xl border border-white/20 bg-transparent text-sm text-gray-200 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="h-10 rounded-xl bg-[#22c55e] px-4 text-sm font-semibold text-white shadow-lg shadow-[#22c55e]/30 transition hover:bg-[#22c55e]/90 disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving
                </span>
              ) : (
                'Create campaign'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
