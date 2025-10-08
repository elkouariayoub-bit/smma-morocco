import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HelpPage() {
  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Need help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Reach out to support@smma-morocco.com and we&apos;ll get back to you shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
