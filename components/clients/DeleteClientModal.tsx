"use client"

import { Loader2, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"

type DeleteClientModalProps = {
  open: boolean
  clientName: string
  onConfirm: () => Promise<void> | void
  onClose: () => void
  isLoading?: boolean
}

export function DeleteClientModal({ open, clientName, onConfirm, onClose, isLoading = false }: DeleteClientModalProps) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-md animate-in fade-in zoom-in rounded-2xl border border-white/10 bg-gray-900/95 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-300">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Remove client</h2>
              <p className="text-sm text-gray-400">This action will remove all synced data for the selected client.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-gray-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5 text-sm text-gray-300">
          <p>
            Are you sure you want to disconnect <span className="font-semibold text-white">{clientName}</span>? You can
            reconnect them later, but any cached analytics will be cleared.
          </p>
          <p className="text-xs text-gray-500">This does not notify your client. You can always add them again.</p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-xl border border-white/15 bg-transparent text-sm text-gray-200 hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-10 rounded-xl bg-red-500 px-4 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-500/90 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Removing
              </span>
            ) : (
              "Disconnect"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
