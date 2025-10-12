import type { ReactNode } from "react"

import type { LucideIcon } from "lucide-react"
import { CheckCircle2, Clock3, Copy, GitBranch, UserRound, XCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})

type DeploymentStatus = "successful" | "in-progress" | "failed"

type Deployment = {
  id: string
  environment: string
  status: DeploymentStatus
  startedAt: string
  completedAt?: string
  commit: {
    sha: string
    message: string
  }
  triggeredBy: string
  duplicateOf?: string
}

const baseDeployment: Deployment = {
  id: "deploy_prod_2024-08-02",
  environment: "Production",
  status: "successful",
  startedAt: "2024-08-02T10:15:00.000Z",
  completedAt: "2024-08-02T10:28:00.000Z",
  commit: {
    sha: "b7f3c2a",
    message: "Ship Gemini powered caption assistant",
  },
  triggeredBy: "Salma Haddad",
}

const duplicatedDeployment: Deployment = {
  id: "deploy_prod_2024-08-02-replica",
  environment: "Production replica",
  status: "successful",
  startedAt: "2024-08-02T10:32:00.000Z",
  completedAt: "2024-08-02T10:44:00.000Z",
  commit: baseDeployment.commit,
  triggeredBy: "Automation",
  duplicateOf: baseDeployment.id,
}

const deployments: Deployment[] = [baseDeployment, duplicatedDeployment]

const statusConfig: Record<DeploymentStatus, { label: string; className: string; Icon: LucideIcon }> = {
  successful: {
    label: "Successful",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
    Icon: CheckCircle2,
  },
  "in-progress": {
    label: "In progress",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
    Icon: Clock3,
  },
  failed: {
    label: "Failed",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
    Icon: XCircle,
  },
}

export default function DeploymentsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deployment duplicated</CardTitle>
          <CardDescription>
            A fresh replica of the latest production deployment was created for validation and QA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryItem
              title="Source deployment"
              primary={baseDeployment.environment}
              secondary={`Completed ${formatDateTime(baseDeployment.completedAt!)}`}
            />
            <SummaryItem
              title="Duplicated as"
              primary={duplicatedDeployment.environment}
              secondary={`Completed ${formatDateTime(duplicatedDeployment.completedAt!)}`}
            />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Both environments point to commit <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs uppercase dark:bg-slate-800">{baseDeployment.commit.sha}</code>, ensuring the
            duplicate mirrors production behaviour.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {deployments.map((deployment) => (
          <DeploymentCard key={deployment.id} deployment={deployment} />
        ))}
      </div>
    </div>
  )
}

type SummaryItemProps = {
  title: string
  primary: string
  secondary: string
}

function SummaryItem({ title, primary, secondary }: SummaryItemProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{primary}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{secondary}</p>
    </div>
  )
}

type DeploymentCardProps = {
  deployment: Deployment
}

function DeploymentCard({ deployment }: DeploymentCardProps) {
  const { label, className, Icon } = statusConfig[deployment.status]

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {deployment.environment}
            </CardTitle>
            <CardDescription>Deployment ID · {deployment.id}</CardDescription>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${className}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{deployment.commit.message}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            icon={GitBranch}
            label="Commit"
            value={
              <span className="font-mono text-xs uppercase text-slate-700 dark:text-slate-200">
                {deployment.commit.sha}
              </span>
            }
          />
          <InfoRow icon={UserRound} label="Triggered by" value={deployment.triggeredBy} />
          <InfoRow icon={Clock3} label="Started" value={formatDateTime(deployment.startedAt)} />
          {deployment.completedAt ? (
            <InfoRow icon={CheckCircle2} label="Completed" value={formatDateTime(deployment.completedAt)} />
          ) : null}
        </div>

        {deployment.duplicateOf ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-100">
            <div className="flex items-center gap-2 font-medium">
              <Copy className="h-4 w-4" aria-hidden="true" />
              Duplicate of {deployment.duplicateOf}
            </div>
            <p className="mt-1 text-xs text-blue-700/80 dark:text-blue-100/70">
              The replica reuses the source commit to rehearse releases without affecting live traffic.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

type InfoRowProps = {
  icon: LucideIcon
  label: string
  value: ReactNode
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </div>
  )
}

function formatDateTime(value: string) {
  return dateFormatter.format(new Date(value))
}
