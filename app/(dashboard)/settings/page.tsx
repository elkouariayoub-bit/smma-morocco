import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Customize your SMMA Morocco workspace. More controls will be available soon.
        </p>
      </CardContent>
    </Card>
  )
}
