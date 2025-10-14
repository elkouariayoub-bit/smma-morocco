'use client'

import * as React from 'react'
import { useMemo, useState } from 'react'
import { Plus, Trash2, Users as UsersIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCurrentRole, type Role } from '@/hooks/use-current-role'

const badgeVariants: Record<'default' | 'secondary' | 'outline', string> = {
  default:
    'bg-[#2563eb] text-white dark:bg-[#2563eb] dark:text-white',
  secondary:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  outline:
    'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-100',
}

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  )
}

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

type AvatarProps = React.HTMLAttributes<HTMLSpanElement> & {
  name: string
  email: string
}

function Avatar({ name, email, className, ...props }: AvatarProps) {
  const initials = useMemo(() => {
    const source = name || email
    return source
      .split(/\s|\.|-|_/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .padEnd(2, '•')
      .slice(0, 2)
  }, [name, email])

  return (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 text-sm font-semibold text-[#2563eb] dark:bg-[#2563eb]/20 dark:text-[#93c5fd]',
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {initials}
    </span>
  )
}

function Separator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('h-px w-full bg-slate-200 dark:bg-slate-800', className)}
    />
  )
}

type ToastVariant = 'default' | 'destructive'

type ToastMessage = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = React.useCallback(
    ({
      title,
      description,
      variant = 'default',
    }: {
      title: string
      description?: string
      variant?: ToastVariant
    }) => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2)

      setToasts((current) => [...current, { id, title, description, variant }])
      const timeout = setTimeout(() => dismiss(id), 4200)
      return () => clearTimeout(timeout)
    },
    [dismiss],
  )

  return { toast, dismiss, toasts }
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            'rounded-lg border px-4 py-3 shadow-lg transition',
            toast.variant === 'destructive'
              ? 'border-red-200 bg-white text-red-900 dark:border-red-500/40 dark:bg-slate-900 dark:text-red-200'
              : 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {toast.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-md p-1 text-xs font-semibold uppercase tracking-wide text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Dismiss toast"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

type Member = {
  id: string
  name: string
  email: string
  role: Role
}

const initialMembers: Member[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@company.com', role: 'owner' },
  { id: '2', name: 'Bob Martin', email: 'bob@company.com', role: 'admin' },
  { id: '3', name: 'Carol Chen', email: 'carol@company.com', role: 'editor' },
]

const seatLimit = 5

const currentUserRole: Role = 'owner'

function formatRole(role: Role) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function nameFromEmail(email: string) {
  const localPart = email.split('@')[0] ?? ''
  if (!localPart) {
    return 'New teammate'
  }
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function RoleBadge({ role }: { role: Role }) {
  const variant: BadgeProps['variant'] =
    role === 'owner' ? 'default' : role === 'admin' ? 'secondary' : 'outline'

  return (
    <Badge variant={variant}>{formatRole(role)}</Badge>
  )
}

export default function UsersPage() {
  const workspaceRole = useCurrentRole()
  const [viewerRole, setViewerRole] = useState<Role>(workspaceRole ?? currentUserRole)
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [email, setEmail] = useState('')
  const [invitedRole, setInvitedRole] = useState<Role>('admin')
  const { toast, dismiss, toasts } = useToast()

  const seatsUsed = members.length
  const isSeatLimitReached = seatsUsed >= seatLimit
  const canManageMembers = viewerRole === 'owner' || viewerRole === 'admin'

  const handleAddMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canManageMembers) {
      toast({
        title: 'Insufficient permissions',
        description: 'Only owners or admins can add teammates.',
        variant: 'destructive',
      })
      return
    }

    if (isSeatLimitReached) {
      toast({
        title: 'Seat limit reached',
        description: 'Upgrade your plan to invite additional members.',
        variant: 'destructive',
      })
      return
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      toast({
        title: 'Email required',
        description: 'Enter an email address before sending an invite.',
        variant: 'destructive',
      })
      return
    }

    if (members.some((member) => member.email.toLowerCase() === normalizedEmail)) {
      toast({
        title: 'Member already exists',
        description: `${normalizedEmail} is already part of this workspace.`,
        variant: 'destructive',
      })
      return
    }

    const newMember: Member = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
      name: nameFromEmail(normalizedEmail),
      email: normalizedEmail,
      role: invitedRole,
    }

    setMembers((current) => [...current, newMember])
    setEmail('')

    toast({
      title: 'Invite sent',
      description: `${normalizedEmail} was added as ${formatRole(invitedRole)}.`,
    })
    // Replace local state with a real API call when backend integration is available.
  }

  const handleRemoveMember = (memberId: string, memberRole: Role) => {
    if (!canManageMembers) {
      toast({
        title: 'Insufficient permissions',
        description: 'Only owners or admins can remove teammates.',
        variant: 'destructive',
      })
      return
    }

    if (memberRole === 'owner') {
      toast({
        title: 'Cannot remove owner',
        description: 'Transfer ownership before removing the owner account.',
        variant: 'destructive',
      })
      return
    }

    setMembers((current) => current.filter((member) => member.id !== memberId))
    toast({
      title: 'Member removed',
      description: 'The teammate no longer has access to this workspace.',
    })
    // Swap this local mutation with a delete request to your API once available.
  }

  const handleUpgrade = () => {
    toast({
      title: 'Upgrade plan',
      description: 'Connect billing to unlock more seats.',
    })
    // Trigger your billing flow from here when subscriptions are wired up.
  }

  const availableSeats = Math.max(seatLimit - seatsUsed, 0)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-16 pt-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <UsersIcon className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">Workspace access</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Team
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Manage who can collaborate on campaigns, adjust permissions, and stay on top of seat usage.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 text-right">
          <Badge variant={isSeatLimitReached ? 'outline' : 'secondary'} className="text-sm">
            {seatsUsed} / {seatLimit} seats
          </Badge>
          {isSeatLimitReached ? (
            <Button variant="outline" onClick={handleUpgrade} className="h-9">
              Upgrade plan
            </Button>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {availableSeats} seats available
            </span>
          )}
        </div>
      </header>

      <Separator />

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Preview as role</CardTitle>
            <CardDescription>
              Switch roles to see how permissions change for different teammates.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['owner', 'admin', 'editor'] as Role[]).map((role) => {
              const isActive = viewerRole === role
              return (
                <Button
                  key={role}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewerRole(role)}
                  aria-pressed={isActive}
                >
                  {formatRole(role)}
                </Button>
              )
            })}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Add a teammate</CardTitle>
          <CardDescription>
            Invite collaborators to your organization. {isSeatLimitReached ? 'All seats are currently in use.' : `${availableSeats} seat${availableSeats === 1 ? '' : 's'} remaining.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6 md:flex-row md:items-end" onSubmit={handleAddMember}>
            <div className="flex-1 space-y-2">
              <label
                htmlFor="invite-email"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>
              <Input
                id="invite-email"
                type="email"
                placeholder="jane@agency.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={!canManageMembers || isSeatLimitReached}
                required
              />
            </div>
            <div className="w-full space-y-2 md:w-48">
              <label
                htmlFor="invite-role"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Role
              </label>
              <Select
                id="invite-role"
                value={invitedRole}
                onChange={(event) => setInvitedRole(event.target.value as Role)}
                disabled={!canManageMembers}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </Select>
            </div>
            <div className="flex w-full items-end md:w-auto">
              <Button
                type="submit"
                className="flex w-full items-center justify-center gap-2 md:w-36"
                disabled={!canManageMembers || isSeatLimitReached}
                aria-disabled={!canManageMembers || isSeatLimitReached}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add user
              </Button>
            </div>
          </form>
          {!canManageMembers ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Editors can’t manage teammates. Switch to an owner or admin role to invite people.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Members</CardTitle>
          <CardDescription>Review active seats and adjust permissions when needed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-transparent bg-white/80 px-4 py-3 transition hover:border-slate-200 hover:bg-white dark:border-slate-800/50 dark:bg-slate-900/60 dark:hover:border-slate-700"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={member.name} email={member.email} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {member.name}
                  </p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RoleBadge role={member.role} />
                {canManageMembers && member.role !== 'owner' ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id, member.role)}
                    className="inline-flex items-center gap-1 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
          {members.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No members yet. Invite your team to get started.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
