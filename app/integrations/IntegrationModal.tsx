"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, Loader2, X as CloseIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useIntegration } from "@/hooks/useIntegration"
import type { IntegrationCredentials } from "@/hooks/useIntegration"
import { cn } from "@/lib/utils"

import type { UserIntegration } from "@/types"
import type { ComponentType, SVGProps } from "react"

type SupportedPlatform = "meta" | "x" | "tiktok"

type IntegrationDefinition = {
  platform: SupportedPlatform
  name: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

type StatusMessage = { status: "idle" | "success" | "error"; message?: string }

type IntegrationModalProps = {
  open: boolean
  definition: IntegrationDefinition
  onClose: () => void
  onIntegrationUpdate: (
    platform: SupportedPlatform,
    integration: UserIntegration | null,
    action?: "connect" | "disconnect" | "refresh",
  ) => void
}

type FieldConfig = {
  key: "api_key" | "api_secret" | "access_token"
  label: string
  placeholder?: string
  autoComplete?: string
  helperLink?: { href: string; label: string }
}

function useClientPortal() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  return mounted
}

export function IntegrationModal({ open, definition, onClose, onIntegrationUpdate }: IntegrationModalProps) {
  const mounted = useClientPortal()
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const { integration, isConnected, isLoading, fetchStatus, testConnection, connect, disconnect } = useIntegration(
    definition.platform,
  )

  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({ status: "idle" })
  const [testSuccessful, setTestSuccessful] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [initialFetchPending, setInitialFetchPending] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fieldConfigs = useMemo<FieldConfig[]>(() => {
    switch (definition.platform) {
      case "meta":
        return [
          {
            key: "access_token",
            label: "Access Token",
            placeholder: "Enter your Meta access token",
            autoComplete: "off",
            helperLink: {
              href: "https://www.facebook.com/business/help",
              label: "Learn how to get your token",
            },
          },
        ]
      case "x":
        return [
          {
            key: "api_key",
            label: "API Key",
            placeholder: "Enter your X API key",
            autoComplete: "off",
          },
          {
            key: "api_secret",
            label: "API Secret",
            placeholder: "Enter your X API secret",
            autoComplete: "off",
          },
        ]
      case "tiktok":
        return [
          {
            key: "access_token",
            label: "Access Token",
            placeholder: "Enter your TikTok access token",
            autoComplete: "off",
          },
        ]
      default:
        return []
    }
  }, [definition.platform])

  useEffect(() => {
    if (!open) {
      setFormValues({})
      setFormErrors({})
      setStatusMessage({ status: "idle" })
      setTestSuccessful(false)
      setIsTesting(false)
      setIsSaving(false)
      setIsDisconnecting(false)
      setFetchError(null)
      setInitialFetchPending(false)
      return
    }

    setInitialFetchPending(true)
    setFetchError(null)
    setFormValues({})
    setFormErrors({})
    setStatusMessage({ status: "idle" })
    setTestSuccessful(false)

    void fetchStatus().then((result) => {
      if (!isMountedRef.current) {
        return
      }

      if (result.success) {
        onIntegrationUpdate(definition.platform, result.integration ?? null, "refresh")
      } else {
        setFetchError(result.message ?? "Unable to load integration.")
      }

      setInitialFetchPending(false)
    })
  }, [open, definition.platform, fetchStatus, onIntegrationUpdate])

  useEffect(() => {
    setStatusMessage({ status: "idle" })
    setFormValues({})
    setFormErrors({})
    setTestSuccessful(false)
  }, [definition.platform])

  const validateFields = useCallback(() => {
    if (!fieldConfigs.length) {
      return true
    }

    const newErrors: Record<string, string> = {}
    for (const field of fieldConfigs) {
      const value = formValues[field.key]?.trim() ?? ""
      if (!value) {
        newErrors[field.key] = "This field is required."
      }
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [fieldConfigs, formValues])

  const handleFieldChange = useCallback((key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
    setFormErrors((prev) => {
      if (!prev[key]) {
        return prev
      }
      const next = { ...prev }
      delete next[key]
      return next
    })
    setTestSuccessful(false)
    setStatusMessage({ status: "idle" })
  }, [])

  const buildCredentials = useCallback(() => {
    return fieldConfigs.reduce<IntegrationCredentials>((acc, field) => {
      const value = formValues[field.key]?.trim() ?? ""
      if (value) {
        acc[field.key] = value
      }
      return acc
    }, {})
  }, [fieldConfigs, formValues])

  const handleTestConnection = useCallback(async () => {
    const valid = validateFields()
    if (!valid) {
      return
    }

    setIsTesting(true)
    setStatusMessage({ status: "idle" })

    try {
      const credentials = buildCredentials()
      const result = await testConnection(credentials)

      if (!result.success) {
        setStatusMessage({ status: "error", message: result.message || "Unable to verify credentials." })
        setTestSuccessful(false)
        return
      }

      setStatusMessage({ status: "success", message: result.message || "Connection verified successfully." })
      setTestSuccessful(true)
    } finally {
      setIsTesting(false)
    }
  }, [buildCredentials, testConnection, validateFields])

  const handleConnect = useCallback(async () => {
    if (!testSuccessful) {
      return
    }

    const valid = validateFields()
    if (!valid) {
      return
    }

    setIsSaving(true)

    try {
      const credentials = buildCredentials()
      const result = await connect(credentials)

      if (!result.success) {
        setStatusMessage({ status: "error", message: result.message || "Failed to save integration credentials." })
        return
      }

      setStatusMessage({ status: "success", message: "Integration connected successfully." })
      onIntegrationUpdate(definition.platform, result.integration ?? null, "connect")
      setTestSuccessful(false)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }, [buildCredentials, connect, definition.platform, onClose, onIntegrationUpdate, testSuccessful, validateFields])

  const handleDisconnect = useCallback(async () => {
    const confirmed = typeof window !== "undefined" ? window.confirm("Disconnect this integration?") : true
    if (!confirmed) {
      return
    }

    setIsDisconnecting(true)

    try {
      const result = await disconnect()

      if (!result.success) {
        setStatusMessage({ status: "error", message: result.message || "Failed to disconnect integration." })
        return
      }

      setStatusMessage({ status: "success", message: "Integration disconnected." })
      onIntegrationUpdate(definition.platform, null, "disconnect")
      setTestSuccessful(false)
      onClose()
    } finally {
      setIsDisconnecting(false)
    }
  }, [definition.platform, disconnect, onClose, onIntegrationUpdate])

  const handleRetry = useCallback(() => {
    setInitialFetchPending(true)
    setFetchError(null)
    setStatusMessage({ status: "idle" })

    void fetchStatus().then((result) => {
      if (!isMountedRef.current) {
        return
      }

      if (result.success) {
        onIntegrationUpdate(definition.platform, result.integration ?? null, "refresh")
      } else {
        setFetchError(result.message ?? "Unable to load integration.")
      }

      setInitialFetchPending(false)
    })
  }, [definition.platform, fetchStatus, onIntegrationUpdate])

  const showLoading = initialFetchPending && !fetchError
  const currentIntegration = integration

  const renderBody = () => {
    if (showLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Loading integration details…</span>
        </div>
      )
    }

    if (fetchError) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-red-400">{fetchError}</p>
          <Button variant="secondary" onClick={handleRetry} disabled={isLoading}>
            Try again
          </Button>
        </div>
      )
    }

    if (isConnected && currentIntegration?.is_connected) {
      const connectedAt = currentIntegration.updated_at || currentIntegration.created_at
      const formattedDate = connectedAt
        ? new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(connectedAt))
        : null

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Connected successfully</p>
              {formattedDate ? <p className="text-xs text-emerald-200/80">Connected on {formattedDate}</p> : null}
            </div>
          </div>
          {currentIntegration.metadata && Object.keys(currentIntegration.metadata).length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-100">Account details</h3>
              <div className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
                {Object.entries(currentIntegration.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <span className="capitalize text-gray-400">{key.replace(/_/g, " ")}</span>
                    <span className="text-gray-100">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Disconnecting…
                </>
              ) : (
                "Disconnect"
              )}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="space-y-5">
          {fieldConfigs.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-200" htmlFor={`${definition.platform}-${field.key}`}>
                {field.label}
              </label>
              <Input
                id={`${definition.platform}-${field.key}`}
                type="password"
                value={formValues[field.key] ?? ""}
                onChange={(event) => handleFieldChange(field.key, event.target.value)}
                autoComplete={field.autoComplete}
                className={cn(
                  "border-white/15 bg-white/5 text-sm text-gray-100 placeholder:text-gray-500",
                  "focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-white/20",
                )}
              />
              {formErrors[field.key] ? <p className="text-xs text-red-400">{formErrors[field.key]}</p> : null}
              {field.helperLink ? (
                <a
                  href={field.helperLink.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-300 hover:text-sky-200"
                >
                  {field.helperLink.label}
                </a>
              ) : null}
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400">Your credentials are encrypted and stored securely.</p>

        {statusMessage.status !== "idle" ? (
          <div
            className={cn(
              "rounded-lg border p-3 text-sm",
              statusMessage.status === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/40 bg-red-500/10 text-red-200",
            )}
          >
            {statusMessage.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="sm:w-auto"
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Testing…
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
          <Button type="button" onClick={handleConnect} disabled={!testSuccessful || isSaving} className="sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Connecting…
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (!open || !mounted) {
    return null
  }

  const Icon = definition.icon

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <Card
        className="relative w-full max-w-lg border-white/10 bg-card/80 text-gray-100 shadow-2xl backdrop-blur-lg animate-in fade-in duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <CardHeader className="space-y-2 border-b border-white/10 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-50">{definition.name}</CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Connect your {definition.name} account
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-transparent text-gray-400 hover:border-white/20 hover:bg-white/10 hover:text-gray-100"
              aria-label="Close"
            >
              <CloseIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">{renderBody()}</CardContent>
      </Card>
    </div>,
    document.body,
  )
}

export type { IntegrationDefinition, SupportedPlatform }
