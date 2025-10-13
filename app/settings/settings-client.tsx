"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useTheme } from "next-themes"
import { useForm } from "react-hook-form"
import {
  CheckCircle2,
  ChevronDown,
  Globe,
  KeyRound,
  Loader2,
  MoonStar,
  Shield,
  SunMedium,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/settings/ConfirmDialog"
import { trackSettingsEvent } from "@/lib/settings-analytics"
import {
  LANGUAGE_OPTIONS,
  SETTINGS_THEME_OPTIONS,
  TIMEZONE_OPTIONS,
  type SettingsNotifications,
  type SettingsTheme,
  type SettingsView,
} from "@/lib/settings-shared"
import { cn } from "@/lib/utils"

const MUTED_TEXT_CLASS = "text-[#9ca3af] dark:text-[#9ca3af]"

type ProfileFormValues = {
  fullName: string
  company: string
  role: string
  contactEmail: string
  language: string
  timezone: string
}

type ApiKeyFormValues = {
  apiKey: string
  label: string
}

type StatusState = { state: "idle" | "saving" | "success" | "error"; message?: string }

interface SettingsClientProps {
  initialSettings: SettingsView
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<SettingsView>(initialSettings)
  const [profileStatus, setProfileStatus] = useState<StatusState>({ state: "idle" })
  const [apiStatus, setApiStatus] = useState<StatusState>({ state: "idle" })
  const [preferencesStatus, setPreferencesStatus] = useState<StatusState>({ state: "idle" })
  const [announcement, setAnnouncement] = useState("")
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revokeLoading, setRevokeLoading] = useState(false)
  const [themeMounted, setThemeMounted] = useState(false)
  const [preferredTheme, setPreferredTheme] = useState<SettingsTheme>(initialSettings.theme)
  const [notifications, setNotifications] = useState<SettingsNotifications>(initialSettings.notifications)

  const { setTheme } = useTheme()

  useEffect(() => {
    setThemeMounted(true)
  }, [])

  useEffect(() => {
    setPreferredTheme(settings.theme)
    setNotifications(settings.notifications)
  }, [settings])

  useEffect(() => {
    if (themeMounted) {
      setTheme(preferredTheme)
    }
  }, [preferredTheme, setTheme, themeMounted])

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: initialSettings.fullName ?? "",
      company: initialSettings.company ?? "",
      role: initialSettings.role ?? "",
      contactEmail: initialSettings.contactEmail ?? "",
      language: initialSettings.language ?? "en",
      timezone: initialSettings.timezone ?? "Africa/Casablanca",
    },
    mode: "onChange",
  })

  const apiForm = useForm<ApiKeyFormValues>({
    defaultValues: {
      apiKey: "",
      label: initialSettings.apiKeyLabel ?? "",
    },
    mode: "onChange",
  })

  const watchedProfile = profileForm.watch() as Partial<ProfileFormValues>
  const profileChanged = useMemo(() => {
    const normalize = (value: unknown) => (typeof value === "string" ? value.trim() : "")
    const baseline = {
      fullName: (settings.fullName ?? "").trim(),
      company: (settings.company ?? "").trim(),
      role: (settings.role ?? "").trim(),
      contactEmail: (settings.contactEmail ?? "").trim(),
      language: settings.language ?? "",
      timezone: settings.timezone ?? "",
    }
    const current = {
      fullName: normalize(watchedProfile.fullName),
      company: normalize(watchedProfile.company),
      role: normalize(watchedProfile.role),
      contactEmail: normalize(watchedProfile.contactEmail),
      language: normalize(watchedProfile.language),
      timezone: normalize(watchedProfile.timezone),
    }

    return (
      current.fullName !== baseline.fullName ||
      current.company !== baseline.company ||
      current.role !== baseline.role ||
      current.contactEmail !== baseline.contactEmail ||
      current.language !== baseline.language ||
      current.timezone !== baseline.timezone
    )
  }, [settings, watchedProfile])

  useEffect(() => {
    profileForm.reset({
      fullName: settings.fullName ?? "",
      company: settings.company ?? "",
      role: settings.role ?? "",
      contactEmail: settings.contactEmail ?? "",
      language: settings.language ?? "en",
      timezone: settings.timezone ?? "Africa/Casablanca",
    })
  }, [profileForm, settings])

  useEffect(() => {
    apiForm.reset({ apiKey: "", label: settings.apiKeyLabel ?? "" })
  }, [apiForm, settings.apiKeyLabel])

  useEffect(() => {
    if (profileStatus.state !== "idle" && profileStatus.state !== "saving" && profileChanged) {
      setProfileStatus({ state: "idle" })
    }
  }, [profileChanged, profileStatus.state])

  const submitSettings = useCallback(async (body: Record<string, unknown>) => {
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const payload = (await response.json().catch(() => ({}))) as {
      success?: boolean
      error?: string
      settings?: SettingsView
      details?: Array<{ message: string }>
    }

    if (!response.ok || !payload.settings) {
      const errorMessage = payload.error || payload.details?.[0]?.message || "Unable to update settings"
      throw new Error(errorMessage)
    }

    setSettings(payload.settings)
    return payload.settings
  }, [])

  const handleProfileSubmit = profileForm.handleSubmit(async (values) => {
    setProfileStatus({ state: "saving" })
    try {
      const next = await submitSettings({
        section: "profile",
        fullName: values.fullName.trim(),
        company: values.company.trim(),
        role: values.role.trim(),
        contactEmail: values.contactEmail.trim(),
        language: values.language,
        timezone: values.timezone,
      })
      setProfileStatus({ state: "success", message: "Profile updated" })
      setAnnouncement("Profile updated successfully")
      trackSettingsEvent("profile")
      profileForm.reset({
        fullName: next.fullName ?? "",
        company: next.company ?? "",
        role: next.role ?? "",
        contactEmail: next.contactEmail ?? "",
        language: next.language ?? "en",
        timezone: next.timezone ?? "Africa/Casablanca",
      })
    } catch (error) {
      setProfileStatus({ state: "error", message: (error as Error).message })
    }
  })

  const handleApiSubmit = apiForm.handleSubmit(async (values) => {
    setApiStatus({ state: "saving" })
    try {
      const next = await submitSettings({
        section: "apiKey",
        apiKey: values.apiKey.trim(),
        label: values.label.trim(),
      })
      setApiStatus({ state: "success", message: "API key saved" })
      setAnnouncement("API key updated successfully")
      trackSettingsEvent("apiKey")
      apiForm.reset({ apiKey: "", label: next.apiKeyLabel ?? "" })
    } catch (error) {
      setApiStatus({ state: "error", message: (error as Error).message })
    }
  })

  const handlePreferencesSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setPreferencesStatus({ state: "saving" })
      try {
        const next = await submitSettings({
          section: "preferences",
          theme: preferredTheme,
          notifications,
        })
        setPreferencesStatus({ state: "success", message: "Preferences saved" })
        setAnnouncement("Preferences updated successfully")
        trackSettingsEvent("preferences")
        setPreferredTheme(next.theme)
        setNotifications(next.notifications)
      } catch (error) {
        setPreferencesStatus({ state: "error", message: (error as Error).message })
      }
    },
    [notifications, preferredTheme, submitSettings],
  )

  const handleThemeSelect = (value: SettingsTheme) => {
    setPreferredTheme(value)
    if (themeMounted) {
      setTheme(value)
    }
  }

  const toggleNotification = (key: keyof SettingsNotifications) => {
    setNotifications((previous) => ({ ...previous, [key]: !previous[key] }))
  }

  const handleRevokeKey = useCallback(async () => {
    setRevokeLoading(true)
    try {
      const next = await submitSettings({ section: "apiKey", action: "revoke" })
      setApiStatus({ state: "success", message: "API key revoked" })
      setAnnouncement("API key revoked")
      trackSettingsEvent("apiKey")
      setRevokeDialogOpen(false)
      apiForm.reset({ apiKey: "", label: next.apiKeyLabel ?? "" })
    } catch (error) {
      setApiStatus({ state: "error", message: (error as Error).message })
    } finally {
      setRevokeLoading(false)
    }
  }, [apiForm, submitSettings])

  useEffect(() => {
    if (!announcement) {
      return
    }
    const timeout = window.setTimeout(() => {
      setAnnouncement("")
    }, 5000)
    return () => window.clearTimeout(timeout)
  }, [announcement])

  const preferencesChanged = useMemo(() => {
    return (
      preferredTheme !== settings.theme ||
      notifications.campaignSummaries !== settings.notifications.campaignSummaries ||
      notifications.performanceAlerts !== settings.notifications.performanceAlerts
    )
  }, [notifications, preferredTheme, settings])

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <SettingsSection
            id="profile"
            title="Profile"
            description="Update how your teammates see you across the SMMA workspace."
          >
            <form className="space-y-5" onSubmit={handleProfileSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Full name"
                  htmlFor="profile-full-name"
                  error={profileForm.formState.errors.fullName?.message}
                >
                  <Input
                    id="profile-full-name"
                    aria-invalid={Boolean(profileForm.formState.errors.fullName)}
                    {...profileForm.register("fullName", {
                      required: "Full name is required",
                      minLength: { value: 2, message: "Full name must be at least 2 characters" },
                    })}
                    className="h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 transition focus-visible:border-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/30 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  />
                </Field>
                <Field label="Company" htmlFor="profile-company" error={profileForm.formState.errors.company?.message}>
                  <Input
                    id="profile-company"
                    {...profileForm.register("company")}
                    placeholder="Atlas Media Group"
                    className="h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 transition focus-visible:border-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/30 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  />
                </Field>
                <Field label="Role" htmlFor="profile-role" error={profileForm.formState.errors.role?.message}>
                  <Input
                    id="profile-role"
                    {...profileForm.register("role")}
                    placeholder="Growth lead"
                    className="h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 transition focus-visible:border-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/30 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  />
                </Field>
                <Field
                  label="Contact email"
                  htmlFor="profile-email"
                  error={profileForm.formState.errors.contactEmail?.message}
                >
                  <Input
                    id="profile-email"
                    type="email"
                    aria-invalid={Boolean(profileForm.formState.errors.contactEmail)}
                    {...profileForm.register("contactEmail", {
                      required: "Contact email is required",
                      pattern: { value: /[^@]+@[^@]+\.[^@]+/, message: "Enter a valid email" },
                    })}
                    className="h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 transition focus-visible:border-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/30 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  />
                </Field>
                <Field
                  label="Language"
                  htmlFor="profile-language"
                  error={profileForm.formState.errors.language?.message}
                >
                  <select
                    id="profile-language"
                    aria-invalid={Boolean(profileForm.formState.errors.language)}
                    {...profileForm.register("language", { required: true })}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 transition focus-visible:border-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/30 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Timezone"
                  htmlFor="profile-timezone"
                  error={profileForm.formState.errors.timezone?.message}
                >
                  <select
                    id="profile-timezone"
                    aria-invalid={Boolean(profileForm.formState.errors.timezone)}
                    {...profileForm.register("timezone", { required: true })}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 transition focus-visible:border-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/30 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  >
                    {TIMEZONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="submit"
                  disabled={!profileChanged || profileStatus.state === "saving"}
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#0070f3] px-5 text-sm font-semibold text-white shadow-lg shadow-[#0070f3]/40 transition hover:bg-[#0064dd] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {profileStatus.state === "saving" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Saving
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Save changes
                    </>
                  )}
                </Button>
                {profileStatus.message ? (
                  <span
                    role="status"
                    className={cn(
                      "text-sm font-medium",
                      profileStatus.state === "error" ? "text-red-500" : "text-emerald-500",
                    )}
                  >
                    {profileStatus.message}
                  </span>
                ) : null}
              </div>
            </form>
          </SettingsSection>

          <SettingsSection
            id="api"
            title="API keys"
            description="Store encrypted credentials for Gemini integrations and platform automations."
            defaultOpen={false}
          >
            <form className="space-y-5" onSubmit={handleApiSubmit}>
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  {settings.hasApiKey ? (
                    <span>
                      Active key
                      {settings.apiKeyLabel ? ` • ${settings.apiKeyLabel}` : ""}
                      {settings.apiKeyLastFour ? ` ending in ${settings.apiKeyLastFour}` : ""}
                    </span>
                  ) : (
                    <span>No API key stored.</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your API secret is encrypted using AES-256-GCM before being saved. Only hashed fingerprints are stored for
                  verification.
                </p>
                {settings.hasApiKey ? (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRevokeDialogOpen(true)}
                      className="h-9 rounded-lg border border-red-400/40 bg-red-500/10 px-4 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                    >
                      Revoke active key
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Label" htmlFor="api-label" error={apiForm.formState.errors.label?.message}>
                  <Input
                    id="api-label"
                    placeholder="Gemini production"
                    {...apiForm.register("label")}
                    className="h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 transition focus-visible:border-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/30 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  />
                </Field>
                <Field label="API key" htmlFor="api-key" error={apiForm.formState.errors.apiKey?.message}>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="••••••••••••••"
                    aria-invalid={Boolean(apiForm.formState.errors.apiKey)}
                    {...apiForm.register("apiKey", {
                      required: "API key is required",
                      minLength: { value: 16, message: "Keys must be at least 16 characters" },
                    })}
                    className="h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 transition focus-visible:border-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/30 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  />
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="submit"
                  disabled={!apiForm.formState.isValid || apiStatus.state === "saving"}
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#0070f3] px-5 text-sm font-semibold text-white shadow-lg shadow-[#0070f3]/40 transition hover:bg-[#0064dd] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {apiStatus.state === "saving" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" aria-hidden="true" />
                      Save API key
                    </>
                  )}
                </Button>
                {apiStatus.message ? (
                  <span
                    role="status"
                    className={cn(
                      "text-sm font-medium",
                      apiStatus.state === "error" ? "text-red-500" : "text-emerald-500",
                    )}
                  >
                    {apiStatus.message}
                  </span>
                ) : null}
              </div>
            </form>
          </SettingsSection>

          <SettingsSection
            id="preferences"
            title="Preferences"
            description="Control workspace theme and notification cadence."
            defaultOpen={false}
          >
            <form className="space-y-6" onSubmit={handlePreferencesSubmit}>
              <div className="space-y-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Theme</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SETTINGS_THEME_OPTIONS.map((theme) => {
                    const isActive = preferredTheme === theme
                    const Icon = theme === "light" ? SunMedium : MoonStar
                    return (
                      <label
                        key={theme}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition",
                          isActive
                            ? "border-[#0070f3] bg-[#0070f3]/10 text-[#0070f3]"
                            : "border-gray-200 bg-white text-gray-600 hover:border-[#0070f3]/60 hover:text-[#0070f3] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300",
                        )}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={theme}
                          checked={isActive}
                          onChange={() => handleThemeSelect(theme)}
                          className="sr-only"
                          aria-label={`Select ${theme} theme`}
                        />
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span className="text-sm font-medium capitalize">{theme}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
                <PreferenceToggle
                  id="notify-summary"
                  checked={notifications.campaignSummaries}
                  label="Weekly campaign summaries"
                  description="Receive a digest of performance metrics every Monday."
                  onChange={() => toggleNotification("campaignSummaries")}
                />
                <PreferenceToggle
                  id="notify-alerts"
                  checked={notifications.performanceAlerts}
                  label="Real-time performance alerts"
                  description="Get notified when CPM spikes or conversions fall below target."
                  onChange={() => toggleNotification("performanceAlerts")}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  type="submit"
                  disabled={!preferencesChanged || preferencesStatus.state === "saving"}
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#0070f3] px-5 text-sm font-semibold text-white shadow-lg shadow-[#0070f3]/40 transition hover:bg-[#0064dd] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {preferencesStatus.state === "saving" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Saving
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Save preferences
                    </>
                  )}
                </Button>
                {preferencesStatus.message ? (
                  <span
                    role="status"
                    className={cn(
                      "text-sm font-medium",
                      preferencesStatus.state === "error" ? "text-red-500" : "text-emerald-500",
                    )}
                  >
                    {preferencesStatus.message}
                  </span>
                ) : null}
              </div>
            </form>
          </SettingsSection>
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#0070f3]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Workspace locale</p>
                <p className={cn("text-xs", MUTED_TEXT_CLASS)}>
                  Current language: <strong className="font-semibold text-gray-700 dark:text-gray-200">{settings.language}</strong>
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Localized experiences roll out gradually. Switching to Arabic automatically adapts typography and RTL layouts when
              available.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Need another integration?</h3>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Generate additional Gemini keys from your Google Cloud console. Paste the token here and we will handle encryption
              and rotation reminders for you.
            </p>
          </div>
        </aside>
      </div>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <ConfirmDialog
        open={revokeDialogOpen}
        onCancel={() => (!revokeLoading ? setRevokeDialogOpen(false) : null)}
        onConfirm={handleRevokeKey}
        isLoading={revokeLoading}
        title="Revoke API key"
        description="This will delete the encrypted key from storage. Any scheduled automations using the key will stop running."
        confirmLabel={revokeLoading ? "Revoking" : "Revoke key"}
      />
    </>
  )
}

type FieldProps = {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-2" htmlFor={htmlFor}>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  )
}

type PreferenceToggleProps = {
  id: string
  checked: boolean
  label: string
  description: string
  onChange: () => void
}

function PreferenceToggle({ id, checked, label, description, onChange }: PreferenceToggleProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-[#0070f3]/60 dark:border-gray-700 dark:bg-gray-950" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={() => onChange()}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0070f3] focus:ring-[#0070f3]"
      />
      <span>
        <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</span>
        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{description}</span>
      </span>
    </label>
  )
}

type SettingsSectionProps = {
  id: string
  title: string
  description: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function SettingsSection({ id, title, description, children, defaultOpen = true }: SettingsSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section
      className="rounded-3xl border border-gray-200 bg-white shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-950"
      aria-labelledby={`${id}-heading`}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-controls={`${id}-content`}
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        <div>
          <h2 id={`${id}-heading`} className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className={cn("text-sm", MUTED_TEXT_CLASS)}>{description}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform",
            open ? "rotate-180 text-[#0070f3]" : "",
          )}
          aria-hidden="true"
        />
      </button>
      <div
        id={`${id}-content`}
        className={cn("border-t border-gray-200 dark:border-gray-800", open ? "block" : "hidden")}
      >
        <div className="px-6 py-6">{children}</div>
      </div>
    </section>
  )
}
