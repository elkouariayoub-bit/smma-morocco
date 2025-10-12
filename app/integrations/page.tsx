import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

const integrations = [
  {
    name: "Facebook Ads",
    description: "Connect your Facebook Ads account to sync campaign performance in real-time.",
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
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your favorite tools to automate workflows and centralize insights.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className="flex flex-col justify-between">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle>{integration.name}</CardTitle>
                <span
                  className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium"
                >
                  {integration.status}
                </span>
              </div>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Manage <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
