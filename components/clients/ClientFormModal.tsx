"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { X, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CLIENT_STATUSES, type ClientFormInput } from "@/lib/clients"
import type { ClientStatus } from "@/lib/clients"

type ClientFormModalProps = {
  open: boolean
  mode: "create" | "edit"
  defaultValues: ClientFormInput
  onClose: () => void
  onSubmit: (values: ClientFormInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage?: string | null
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Active",
  inactive: "Inactive",
}

export function ClientFormModal({
  open,
  mode,
  defaultValues,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: ClientFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting: formSubmitting },
  } = useForm<ClientFormInput>({
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [defaultValues, open, reset])

  if (!open) {
    return null
  }

  const submitting = isSubmitting || formSubmitting
  const title = mode === "create" ? "Add client" : "Edit client"
  const submitLabel = mode === "create" ? "Create" : "Save changes"

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-lg animate-in fade-in zoom-in rounded-2xl border border-white/10 bg-gray-900/95 p-1 text-white shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between rounded-xl bg-gray-900/90 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-gray-400">Manage the client profile details and connection status.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form
          className="space-y-5 px-6 pb-6 pt-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
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
              <label htmlFor="client-name" className="text-sm font-medium text-gray-200">
                Client name
              </label>
              <Input
                id="client-name"
                {...register("name", {
                  required: "Client name is required",
                  minLength: { value: 2, message: "Name must include at least 2 characters" },
                })}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "client-name-error" : undefined}
                placeholder="e.g. Atlas Ventures"
                className="h-11 rounded-xl border border-white/10 bg-white/5 text-base text-white placeholder:text-gray-500 focus-visible:border-[#ff4081] focus-visible:ring-4 focus-visible:ring-[#ff4081]/30"
              />
              {errors.name?.message && (
                <p id="client-name-error" className="text-sm text-red-300">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="client-contact" className="text-sm font-medium text-gray-200">
                Primary contact details
              </label>
              <Input
                id="client-contact"
                type="text"
                {...register("contact", {
                  required: "Contact information is required",
                  minLength: { value: 3, message: "Contact details must be at least 3 characters" },
                })}
                aria-invalid={Boolean(errors.contact)}
                aria-describedby={errors.contact ? "client-contact-error" : undefined}
                placeholder="email@client.ma"
                autoComplete="off"
                className="h-11 rounded-xl border border-white/10 bg-white/5 text-base text-white placeholder:text-gray-500 focus-visible:border-[#ff4081] focus-visible:ring-4 focus-visible:ring-[#ff4081]/30"
              />
              {errors.contact?.message && (
                <p id="client-contact-error" className="text-sm text-red-300">
                  {errors.contact.message}
                </p>
              )}
              <p className="text-xs text-gray-400">Your client's contact details are encrypted before being stored.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="client-status" className="text-sm font-medium text-gray-200">
                Status
              </label>
              <div className="relative">
                <select
                  id="client-status"
                  {...register("status", { required: true })}
                  className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white focus-visible:border-[#ff4081] focus-visible:ring-4 focus-visible:ring-[#ff4081]/30"
                >
                  {CLIENT_STATUSES.map((status) => (
                    <option key={status} value={status} className="bg-gray-900 text-white">
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">▾</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-xl border border-white/15 bg-transparent text-sm text-gray-200 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="h-10 rounded-xl bg-[#ff4081] px-4 text-sm font-semibold text-white shadow-lg shadow-[#ff4081]/40 transition hover:bg-[#ff4081]/90 disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving
                </span>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
