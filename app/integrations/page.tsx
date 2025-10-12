import type { SVGProps } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter } from "lucide-react"

const TikTokIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
    <path
      fill="currentColor"
      d="M16 3.5a3.5 3.5 0 0 0 3.5 3.5V5.1a5 5 0 0 1-3.5-1.4V14a5.5 5.5 0 1 1-5.5-5.5c.35 0 .69.03 1.03.09V6.13A7 7 0 1 0 17 13V3.5Z"
    />
  </svg>
)

const integrations = [
  {
    name: "Meta",
    description: "Connect your Meta Business account to manage Facebook and Instagram campaigns.",
    status: "Available",
    icon: Facebook,
  },
  {
    name: "X",
    description: "Connect your X account to schedule posts and track engagement metrics.",
    status: "Available",
    icon: Twitter,
  },
  {
    name: "TikTok",
    description: "Connect your TikTok Business account to analyze video performance and schedule content.",
    status: "Available",
    icon: TikTokIcon,
  },
]

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect your favorite tools to automate workflows and centralize insights.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map(({ name, description, status, icon: Icon }) => (
          <Card key={name} className="flex h-full flex-col bg-card/60 backdrop-blur">
            <CardHeader className="space-y-4 p-6 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-gray-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-50">
                      {name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {description}
                    </CardDescription>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <span>{status}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="mt-auto p-6 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-full justify-between px-2 text-xs"
              >
                <span>Manage</span>
                <span aria-hidden="true">→</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
