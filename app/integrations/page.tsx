import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const integrations = [
  {
    name: "Facebook Ads",
    description: "Connect your campaigns to sync performance data in real time.",
    status: "Connected",
  },
  {
    name: "Google Analytics",
    description: "Bring in traffic and conversion data to enrich your SMMA reports.",
    status: "Available",
  },
  {
    name: "Stripe",
    description: "Track revenue and subscription metrics alongside marketing efforts.",
    status: "Available",
  },
  {
    name: "Shopify",
    description: "Monitor storefront sales and customer cohorts against marketing activity.",
    status: "Connected",
  },
  {
    name: "Slack",
    description: "Send campaign alerts to your team channels and keep everyone aligned.",
    status: "Connected",
  },
  {
    name: "Notion",
    description: "Sync briefs and content calendars to keep your launch plans in one place.",
    status: "Available",
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
        {integrations.map((integration) => (
          <Card key={integration.name} className="flex h-full flex-col bg-card/60 backdrop-blur">
            <CardHeader className="space-y-3 p-6 pb-4">
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{integration.name}</CardTitle>
                <Button asChild variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <span>{integration.status}</span>
                </Button>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {integration.description}
              </CardDescription>
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
