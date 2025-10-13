"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ChangeEvent, ReactNode } from "react"
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClientFormModal } from "@/components/clients/ClientFormModal"
import { DeleteClientModal } from "@/components/clients/DeleteClientModal"
import type { Client } from "@/types"
import {
  CLIENT_STATUSES,
  trackClientEvent,
  type ClientFormInput,
  type ClientStatus,
} from "@/lib/clients"
import { getOptionalSupabaseBrowserClient } from "@/lib/supabase"
import { useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table"

const PAGE_SIZE_OPTIONS = [10, 20, 50]

type ClientsResponse = {
  data: Client[]
  total: number
  page?: number
  limit?: number
}

type ToastState = { id: number; message: string }

type SelectionCheckboxProps = {
  checked: boolean
  indeterminate?: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  label?: string
}

function SelectionCheckbox({ checked, indeterminate = false, onChange, label }: SelectionCheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        ref={(element) => {
          if (element) {
            element.indeterminate = indeterminate && !checked
          }
        }}
        onChange={onChange}
        className="h-4 w-4 rounded border border-white/20 bg-transparent text-[#ff4081] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4081]/60"
        aria-label={label}
      />
    </label>
  )
}

function formatDate(value: string) {
  try {
    const date = new Date(value)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  } catch (error) {
    return value
  }
}

const STATUS_STYLES: Record<ClientStatus, string> = {
  active: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  inactive: "border-slate-400/40 bg-slate-500/10 text-slate-200",
}

export function ClientTable() {
  const [clients, setClients] = useState<Client[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isFormOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [activeClient, setActiveClient] = useState<Client | null>(null)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
      setPage(1)
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [searchTerm])

  const fetchClients = useCallback(
    async ({ page: requestedPage, limit: requestedLimit, search, withSpinner }: {
      page: number
      limit: number
      search: string
      withSpinner: boolean
    }) => {
      setError(null)
      if (withSpinner) {
        setIsLoading(true)
      } else {
        setIsBackgroundLoading(true)
      }

      try {
        const params = new URLSearchParams({
          page: String(requestedPage),
          limit: String(requestedLimit),
        })
        if (search) {
          params.set("search", search)
        }

        const response = await fetch(`/api/clients?${params.toString()}`)

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(payload?.error ?? "Failed to load clients")
        }

        const payload = (await response.json()) as ClientsResponse
        setClients(payload.data ?? [])
        setTotal(payload.total ?? 0)
        setSelectedIds(new Set())
        if (payload.limit) {
          setLimit(payload.limit)
        }
        if (payload.page) {
          setPage(payload.page)
        } else {
          setPage(requestedPage)
        }
      } catch (error) {
        console.error("Unable to fetch clients", error)
        setError(error instanceof Error ? error.message : "Unable to load clients")
      } finally {
        if (withSpinner) {
          setIsLoading(false)
        } else {
          setIsBackgroundLoading(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    void fetchClients({ page, limit, search: debouncedSearch, withSpinner: true })
  }, [debouncedSearch, fetchClients, limit, page])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const supabase = getOptionalSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    const channel = supabase
      .channel("clients-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clients" },
        () => {
          void fetchClients({ page, limit, search: debouncedSearch, withSpinner: false })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [debouncedSearch, fetchClients, limit, page])

  const allSelected = clients.length > 0 && selectedIds.size === clients.length
  const partiallySelected = selectedIds.size > 0 && selectedIds.size < clients.length

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <SelectionCheckbox
            checked={allSelected}
            indeterminate={partiallySelected}
            onChange={(event) => {
              if (event.target.checked) {
                setSelectedIds(new Set(clients.map((client) => client.id)))
              } else {
                setSelectedIds(new Set())
              }
            }}
            label="Select all clients"
          />
        ),
        cell: ({ row }) => (
          <SelectionCheckbox
            checked={selectedIds.has(row.original.id)}
            onChange={(event) => {
              setSelectedIds((current) => {
                const next = new Set(current)
                if (event.target.checked) {
                  next.add(row.original.id)
                } else {
                  next.delete(row.original.id)
                }
                return next
              })
            }}
            label={`Select ${row.original.name}`}
          />
        ),
      },
      {
        accessorKey: "name",
        header: () => (
          <button
            type="button"
            className="flex items-center gap-1 text-left text-sm font-semibold text-gray-200"
            onClick={() => {
              setSorting((previous) => {
                if (!previous.length || previous[0]?.id !== "name") {
                  return [{ id: "name", desc: false }]
                }
                if (!previous[0]?.desc) {
                  return [{ id: "name", desc: true }]
                }
                return []
              })
            }}
          >
            Client
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">{row.original.name}</span>
            <span className="text-xs text-gray-400">{row.original.contact}</span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => <span className="text-sm font-semibold text-gray-200">Status</span>,
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${STATUS_STYLES[row.original.status]}`}
          >
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            {row.original.status === "active" ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: () => <span className="text-sm font-semibold text-gray-200">Added</span>,
        cell: ({ row }) => <span className="text-sm text-gray-300">{formatDate(row.original.created_at)}</span>,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-lg border border-white/15 bg-white/5 text-xs text-gray-200 hover:bg-white/10"
              onClick={() => {
                setFormMode("edit")
                setActiveClient(row.original)
                setFormOpen(true)
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-lg bg-red-500/80 text-xs font-semibold text-white hover:bg-red-500"
              onClick={() => {
                setActiveClient(row.original)
                setDeleteOpen(true)
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [allSelected, clients, partiallySelected, selectedIds],
  )

  const sortedData = useMemo(() => {
    if (!sorting.length) {
      return clients
    }

    const [{ id, desc }] = sorting
    const compare = (a: Client, b: Client) => {
      switch (id) {
        case "name":
          return desc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
        case "status":
          return desc ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status)
        case "created_at": {
          const aTime = new Date(a.created_at).getTime()
          const bTime = new Date(b.created_at).getTime()
          return desc ? bTime - aTime : aTime - bTime
        }
        default:
          return 0
      }
    }

    return [...clients].sort(compare)
  }, [clients, sorting])

  const table = useReactTable({
    data: sortedData,
    columns,
    state: { sorting, pagination: { pageIndex: page - 1, pageSize: limit } },
    manualPagination: true,
    onSortingChange: setSorting,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  })
  const headerColumns = table.getHeaderGroups()[0]?.headers ?? []

  const handleCreate = useCallback(
    async (values: ClientFormInput) => {
      setIsSubmitting(true)
      try {
        const response = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(payload?.error ?? "Failed to create client")
        }

        const payload = (await response.json()) as { client: Client }
        trackClientEvent("client_added", { client_id: payload.client.id })
        setToast({ id: Date.now(), message: `${payload.client.name} added to your workspace.` })
        setFormOpen(false)
        setActiveClient(null)
        await fetchClients({ page: 1, limit, search: debouncedSearch, withSpinner: false })
        setPage(1)
      } catch (error) {
        console.error("Unable to create client", error)
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [debouncedSearch, fetchClients, limit],
  )

  const handleUpdate = useCallback(
    async (values: ClientFormInput, clientId: string) => {
      setIsSubmitting(true)
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(payload?.error ?? "Failed to update client")
        }

        const payload = (await response.json()) as { client: Client }
        trackClientEvent("client_edited", { client_id: payload.client.id })
        setToast({ id: Date.now(), message: `${payload.client.name} updated successfully.` })
        setFormOpen(false)
        setActiveClient(null)
        await fetchClients({ page, limit, search: debouncedSearch, withSpinner: false })
      } catch (error) {
        console.error("Unable to update client", error)
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [debouncedSearch, fetchClients, limit, page],
  )

  const handleDelete = useCallback(
    async (clientId: string) => {
      setIsDeleting(true)
      try {
        const response = await fetch(`/api/clients/${clientId}`, { method: "DELETE" })
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(payload?.error ?? "Failed to delete client")
        }

        setToast({ id: Date.now(), message: "Client removed from workspace." })
        setDeleteOpen(false)
        setActiveClient(null)
        await fetchClients({ page, limit, search: debouncedSearch, withSpinner: false })
      } catch (error) {
        console.error("Unable to delete client", error)
        throw error
      } finally {
        setIsDeleting(false)
      }
    },
    [debouncedSearch, fetchClients, limit, page],
  )

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const fromItem = total === 0 ? 0 : (page - 1) * limit + 1
  const toItem = Math.min(total, page * limit)

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-gray-400">Clients</span>
          </div>
          <h1 className="text-3xl font-semibold text-white">Client directory</h1>
          <p className="text-sm text-gray-400">
            Monitor onboarding status, campaign readiness, and contact preferences for every client account.
          </p>
        </div>
        <Button
          type="button"
          className="flex h-11 items-center gap-2 rounded-xl bg-[#ff4081] px-4 text-sm font-semibold text-white shadow-lg shadow-[#ff4081]/40 transition hover:bg-[#ff4081]/90"
          onClick={() => {
            setFormMode("create")
            setActiveClient(null)
            setFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add client
        </Button>
      </header>

      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-gray-950/80 p-6 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search clients by name or contact"
              aria-label="Search clients"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 text-sm text-white placeholder:text-gray-500 focus-visible:border-[#ff4081] focus-visible:ring-4 focus-visible:ring-[#ff4081]/30"
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="hidden md:inline">Rows per page</span>
            <select
              value={limit}
              onChange={(event) => {
                const nextLimit = Number(event.target.value)
                setLimit(nextLimit)
                setPage(1)
              }}
              className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus-visible:border-[#ff4081] focus-visible:ring-4 focus-visible:ring-[#ff4081]/30"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-gray-900 text-white">
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-lg border border-white/20 bg-transparent text-xs text-red-100 hover:bg-white/10"
              onClick={() => void fetchClients({ page, limit, search: debouncedSearch, withSpinner: true })}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left" role="table">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-gray-300">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} scope="col" className="px-4 py-3">
                        {header.render()}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-white/10">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-4 py-5">
                        <div className="h-4 w-4 rounded bg-white/10" />
                      </td>
                      <td className="px-4 py-5">
                        <div className="h-4 w-48 rounded bg-white/10" />
                        <div className="mt-2 h-3 w-32 rounded bg-white/5" />
                      </td>
                      <td className="px-4 py-5">
                        <div className="h-6 w-20 rounded-full bg-white/10" />
                      </td>
                      <td className="px-4 py-5">
                        <div className="h-4 w-24 rounded bg-white/10" />
                      </td>
                      <td className="px-4 py-5">
                        <div className="ml-auto h-8 w-28 rounded bg-white/10" />
                      </td>
                    </tr>
                  ))
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                        <Users className="h-8 w-8 text-gray-500" aria-hidden="true" />
                        <p className="text-base font-semibold text-white">Add your first client</p>
                        <p className="text-sm text-gray-400">
                          Start by connecting a new client profile to track onboarding progress and campaign activity in real
                          time.
                        </p>
                        <Button
                          type="button"
                          className="mt-2 flex items-center gap-2 rounded-xl bg-[#ff4081] px-4 text-sm font-semibold text-white hover:bg-[#ff4081]/90"
                          onClick={() => {
                            setFormMode("create")
                            setActiveClient(null)
                            setFormOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          New client
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="group cursor-pointer bg-white/0 transition hover:bg-white/5 focus-within:bg-white/10"
                      tabIndex={0}
                      onClick={() => {
                        setFormMode("edit")
                        setActiveClient(row.original)
                        setFormOpen(true)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          setFormMode("edit")
                          setActiveClient(row.original)
                          setFormOpen(true)
                        }
                      }}
                    >
                      {headerColumns.map((header) => {
                        const column = header.column
                        const key = column.accessorKey as keyof Client | undefined
                        const defaultValue = key ? row.original[key] : undefined
                        const getValue = () => defaultValue

                        const content: ReactNode = column.cell
                          ? column.cell({ row, table, getValue })
                          : (defaultValue as ReactNode)

                        return (
                          <td
                            key={`${row.id}-${column.id ?? column.accessorKey ?? 'col'}`}
                            className="px-4 py-4 align-middle text-sm text-gray-200"
                          >
                            {content}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-gray-400">
            Showing <span className="font-semibold text-white">{fromItem}</span> to {" "}
            <span className="font-semibold text-white">{toItem}</span> of{" "}
            <span className="font-semibold text-white">{total}</span> clients
            {isBackgroundLoading && (
              <span className="ml-3 inline-flex items-center gap-1 text-xs text-gray-300">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Refreshing
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex h-9 items-center gap-1 rounded-xl border border-white/15 bg-transparent text-xs text-gray-200 hover:bg-white/10"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
            </Button>
            <span className="text-xs text-gray-400">
              Page <span className="font-semibold text-white">{page}</span> of {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex h-9 items-center gap-1 rounded-xl border border-white/15 bg-transparent text-xs text-gray-200 hover:bg-white/10"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {formMode === "create" ? (
        <ClientFormModal
          open={isFormOpen}
          mode="create"
          defaultValues={{ name: "", contact: "", status: CLIENT_STATUSES[0] }}
          onClose={() => {
            setFormOpen(false)
            setActiveClient(null)
          }}
          onSubmit={async (values) => {
            try {
              await handleCreate(values)
            } catch (error) {
              setToast({ id: Date.now(), message: error instanceof Error ? error.message : "Failed to create client" })
            }
          }}
          isSubmitting={isSubmitting}
        />
      ) : (
        <ClientFormModal
          open={isFormOpen}
          mode="edit"
          defaultValues={{
            name: activeClient?.name ?? "",
            contact: activeClient?.contact ?? "",
            status: (activeClient?.status ?? "active") as ClientStatus,
          }}
          onClose={() => {
            setFormOpen(false)
            setActiveClient(null)
          }}
          onSubmit={async (values) => {
            if (!activeClient) {
              return
            }
            try {
              await handleUpdate(values, activeClient.id)
            } catch (error) {
              setToast({ id: Date.now(), message: error instanceof Error ? error.message : "Failed to update client" })
            }
          }}
          isSubmitting={isSubmitting}
        />
      )}

      <DeleteClientModal
        open={isDeleteOpen}
        clientName={activeClient?.name ?? "this client"}
        onClose={() => {
          setDeleteOpen(false)
          setActiveClient(null)
        }}
        onConfirm={async () => {
          if (!activeClient) {
            return
          }
          try {
            await handleDelete(activeClient.id)
          } catch (error) {
            setToast({ id: Date.now(), message: error instanceof Error ? error.message : "Failed to delete client" })
          }
        }}
        isLoading={isDeleting}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/10 bg-gray-900/95 px-4 py-3 text-sm text-white shadow-xl">
          {toast.message}
        </div>
      )}
    </section>
  )
}
