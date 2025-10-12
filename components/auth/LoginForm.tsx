"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trackAuthEvent } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"

type LoginFormValues = {
  email: string
  password: string
}

type LoginFormProps = {
  defaultRedirect?: string
  nextPath?: string | null
  initialMessage?: string | null
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

export function LoginForm({
  defaultRedirect = "/dashboard",
  nextPath = null,
  initialMessage = null,
}: LoginFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  })

  const emailValue = watch("email") as string
  const passwordValue = watch("password") as string
  const rootError = errors.root?.message

  useEffect(() => {
    if (initialMessage) {
      setError("root", { type: "server", message: initialMessage })
    }
  }, [initialMessage, setError])

  useEffect(() => {
    if (errors.root?.message && (emailValue || passwordValue)) {
      clearErrors("root")
    }
  }, [clearErrors, emailValue, errors.root?.message, passwordValue])

  const isSubmitDisabled = !isValid || isSubmitting

  const onSubmit = handleSubmit(async (values) => {
    trackAuthEvent("login_attempt", { method: "password" })

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, next: nextPath ?? undefined }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        const message = payload?.error ?? "Unable to sign in. Please try again."
        setError("root", { type: "server", message })
        return
      }

      const payload = (await response.json()) as { user?: { id: string }; redirectTo?: string }

      if (!payload.user?.id) {
        setError("root", { type: "server", message: "Unexpected authentication response." })
        return
      }

      trackAuthEvent("login_success", { method: "password" })

      const redirectTarget = payload.redirectTo ?? defaultRedirect
      router.replace(redirectTarget)
      router.refresh()
    } catch (error) {
      console.error("Failed to submit login form", error)
      setError("root", { type: "server", message: "Network error. Please try again." })
    }
  })

  const handleGoogleSignIn = useCallback(() => {
    if (isGoogleLoading) return
    if (typeof window === "undefined") return

    trackAuthEvent("google_auth_initiated", { method: "google_oauth" })
    setIsGoogleLoading(true)

    const target = new URL("/api/auth/google", window.location.origin)
    if (nextPath) {
      target.searchParams.set("next", nextPath)
    }

    window.location.href = target.toString()
  }, [isGoogleLoading, nextPath])

  const passwordToggleLabel = showPassword ? "Hide password" : "Show password"

  return (
    <Card className="border border-slate-200/10 bg-white/80 shadow-xl backdrop-blur dark:border-slate-800/50 dark:bg-slate-900/70">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Sign in to your workspace
        </CardTitle>
        <CardDescription className="text-base text-slate-600 dark:text-slate-300">
          Access the SMMA Morocco dashboard with your credentials or continue with Google.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {rootError && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-300"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
            <span>{rootError}</span>
          </div>
        )}

        <form className="space-y-5" noValidate onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                aria-label="Email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                autoComplete="email"
                className={cn(
                  "h-12 rounded-xl border border-slate-200/80 bg-white/60 pl-12 text-base text-slate-900 placeholder:text-slate-500 focus-visible:border-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/30 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:border-[#0070f3]",
                )}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: EMAIL_REGEX, message: "Enter a valid email address" },
                })}
              />
            </div>
            {errors.email?.message && (
              <p id="email-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                aria-label="Password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                autoComplete="current-password"
                className={cn(
                  "h-12 rounded-xl border border-slate-200/80 bg-white/60 pl-12 pr-12 text-base text-slate-900 placeholder:text-slate-500 focus-visible:border-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/30 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:border-[#0070f3]",
                )}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:text-[#0070f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2 dark:text-slate-300"
                aria-label={passwordToggleLabel}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.password?.message && (
              <p id="password-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
            <div className="flex items-center justify-between text-sm">
              <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Your credentials are encrypted and stored securely.
              </p>
              <Link
                href="/auth/reset"
                className="font-medium text-[#0070f3] transition hover:text-[#005bd1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#0070f3] text-base font-semibold text-white transition hover:bg-[#0062d1] focus-visible:ring-4 focus-visible:ring-[#0070f3]/40"
            disabled={isSubmitDisabled}
          >
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />}
            Sign in
          </Button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
            Or
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-slate-300 bg-white text-base font-semibold text-slate-700 transition hover:border-[#0070f3] hover:text-[#0070f3] focus-visible:ring-4 focus-visible:ring-[#0070f3]/40 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:hover:border-[#0070f3]"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  focusable="false"
                >
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.76 3.28-8.07z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.68l-3.57-2.75c-.99.66-2.26 1.05-3.71 1.05-2.85 0-5.26-1.92-6.12-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.88 14.11A7.01 7.01 0 015.5 12c0-.73.13-1.43.38-2.11V7.05H2.18A11 11 0 001 12c0 1.78.43 3.46 1.18 4.95l3.7-2.84z" />
                  <path fill="#EA4335" d="M12 5.88c1.62 0 3.08.56 4.23 1.66l3.16-3.16C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.7 2.84C6.74 7.8 9.15 5.88 12 5.88z" />
                </svg>
              </span>
            )}
            Continue with Google
          </Button>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Need an account? Contact your SMMA administrator for access.
        </p>
      </CardContent>
    </Card>
  )
}
