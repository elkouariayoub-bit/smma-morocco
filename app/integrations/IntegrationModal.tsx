"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Loader2, CheckCircle2, X as CloseIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  definition: IntegrationDefinition | null
  onClose: () => void
  onIntegrationUpdate: (platform: SupportedPlatform, integration: UserIntegration | null) => void
}

type FieldConfig = {
  key: "api_key" | "api_secret" | "access_token"
  label: string
  placeholder?: string
  autoComplete?: string
  helperLink?: { href: string; label: string }
}

type FetchState = {
  loading: boolean
  error: string | null
  integration: UserIntegration | null
}

const initialFetchState: FetchState = {
  loading: false,
  error: null,
  integration: null,
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
  const [fetchState, setFetchState] = useState<FetchState>(initialFetchState)
  const [reloadToken, setReloadToken] = useState(0)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({ status: "idle" })
  const [testSuccessful, setTestSuccessful] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const platform = definition?.platform ?? null

  const fieldConfigs = useMemo<FieldConfig[]>(() => {
    if (!definition) {
      return []
    }

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
  }, [definition])

  useEffect(() => {
    if (!open) {
      setFetchState(initialFetchState)
      setFormValues({})
      setFormErrors({})
      setStatusMessage({ status: "idle" })
      setTestSuccessful(false)
      setIsTesting(false)
      setIsSaving(false)
      setIsDisconnecting(false)
    }
  }, [open])

  useEffect(() => {
    if (!open || !platform) {
      return
    }

    setFetchState(initialFetchState)
    setFormValues({})
    setFormErrors({})
    setStatusMessage({ status: "idle" })
    setTestSuccessful(false)
    setIsTesting(false)
    setIsSaving(false)
    setIsDisconnecting(false)
    setReloadToken((value) => value + 1)
  }, [open, platform])

  useEffect(() => {
    if (!open || !platform) {
      return
    }

    const abortController = new AbortController()
    const currentPlatform = platform

    async function loadIntegration() {
      setFetchState({ loading: true, error: null, integration: null })

      try {
        const response = await fetch(`/api/integrations/${currentPlatform}`, {
          method: "GET",
          signal: abortController.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to load integration")
        }

        const data = (await response.json()) as { integration: UserIntegration | null }
        setFetchState({ loading: false, error: null, integration: data.integration })
        if (data.integration) {
          onIntegrationUpdate(currentPlatform, data.integration)
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return
        }
        console.error("Error loading integration", error)
        setFetchState({ loading: false, error: "Unable to load integration.", integration: null })
      }
    }

    loadIntegration()

    return () => {
      abortController.abort()
    }
  }, [open, platform, onIntegrationUpdate, reloadToken])

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

  const handleFieldChange = useCallback(
    (key: string, value: string) => {
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
    },
    [],
  )

  const handleTestConnection = useCallback(async () => {
    if (!platform) {
      return
    }

    const valid = validateFields()
    if (!valid) {
      return
    }

    setIsTesting(true)
    setStatusMessage({ status: "idle" })

    try {
      const response = await fetch(`/api/integrations/${platform}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setStatusMessage({ status: "error", message: result.message || "Unable to verify credentials." })
        setTestSuccessful(false)
        return
      }

      setStatusMessage({ status: "success", message: result.message || "Connection verified successfully." })
      setTestSuccessful(true)
    } catch (error) {
      console.error("Error testing integration", error)
      setStatusMessage({ status: "error", message: "Something went wrong while testing your credentials." })
      setTestSuccessful(false)
    } finally {
      setIsTesting(false)
    }
  }, [formValues, platform, validateFields])

  const handleConnect = useCallback(async () => {
    if (!platform || !testSuccessful) {
      return
    }

    const valid = validateFields()
    if (!valid) {
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/integrations/${platform}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Unable to connect integration")
      }

      const data = (await response.json()) as { integration: UserIntegration | null }
      setFetchState({ loading: false, error: null, integration: data.integration })
      setStatusMessage({ status: "success", message: "Integration connected successfully." })
      setTestSuccessful(false)
      onIntegrationUpdate(platform, data.integration)
    } catch (error) {
      console.error("Error connecting integration", error)
      setStatusMessage({ status: "error", message: "Failed to save integration credentials." })
    } finally {
      setIsSaving(false)
    }
  }, [formValues, onIntegrationUpdate, platform, testSuccessful, validateFields])

  const handleDisconnect = useCallback(async () => {
    if (!platform) {
      return
    }

    const confirmed = typeof window !== "undefined" ? window.confirm("Disconnect this integration?") : true
    if (!confirmed) {
      return
    }

    setIsDisconnecting(true)

    try {
      const response = await fetch(`/api/integrations/${platform}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Unable to disconnect integration")
      }

      setFetchState({ loading: false, error: null, integration: null })
      setFormValues({})
      setStatusMessage({ status: "success", message: "Integration disconnected." })
      onIntegrationUpdate(platform, null)
    } catch (error) {
      console.error("Error disconnecting integration", error)
      setStatusMessage({ status: "error", message: "Failed to disconnect integration." })
    } finally {
      setIsDisconnecting(false)
    }
  }, [onIntegrationUpdate, platform])

  const renderBody = () => {
    if (fetchState.loading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Loading integration details…</span>
        </div>
      )
    }

    if (fetchState.error) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-red-400">{fetchState.error}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setFetchState(initialFetchState)
              setReloadToken((value) => value + 1)
            }}
          >
            Try again
          </Button>
        </div>
      )
    }

    if (fetchState.integration?.is_connected) {
      const connectedAt = fetchState.integration.updated_at || fetchState.integration.created_at
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
              {formattedDate ? (
                <p className="text-xs text-emerald-200/80">Connected on {formattedDate}</p>
              ) : null}
            </div>
          </div>
          {fetchState.integration.metadata && Object.keys(fetchState.integration.metadata).length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-100">Account details</h3>
              <div className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
                {Object.entries(fetchState.integration.metadata).map(([key, value]) => (
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
              <label className="text-sm font-medium text-gray-200" htmlFor={`${platform}-${field.key}`}>
                {field.label}
              </label>
              <Input
                id={`${platform}-${field.key}`}
                type="password"
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={formValues[field.key] ?? ""}
                onChange={(event) => handleFieldChange(field.key, event.target.value)}
                className={cn(
                  "h-11 rounded-lg border border-white/15 bg-white/10 text-sm text-gray-100 placeholder:text-gray-400",
                  "focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-white/20",
                )}
              />
              {formErrors[field.key] ? (
                <p className="text-xs text-red-400">{formErrors[field.key]}</p>
              ) : null}
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
          <Button
            type="button"
            onClick={handleConnect}
            disabled={!testSuccessful || isSaving}
            className="sm:w-auto"
          >
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

  if (!open || !definition || !mounted) {
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
