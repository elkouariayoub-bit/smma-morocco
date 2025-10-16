"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface KPIs {
  engagementRate: string
  engagementDelta?: string
  impressions: string
  impressionsNote?: string
  reached: string
  reachedNote?: string
}

const kpis: KPIs = {
  engagementRate: "5.5%",
  engagementDelta: "+42.2 pts vs période précédente",
  impressions: "166 068",
  impressionsNote: "Total sur la période sélectionnée",
  reached: "47 889",
  reachedNote: "77 241 visites enregistrées",
}

export function DashboardKPI() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>KPIs clés pour la période sélectionnée</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border md:grid-cols-3 md:divide-y-0 md:divide-x">
          <div className="space-y-1 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Taux d’engagement</p>
            <p className="text-3xl font-semibold tracking-tight">{kpis.engagementRate}</p>
            {kpis.engagementDelta ? (
              <p className="text-xs text-muted-foreground">{kpis.engagementDelta}</p>
            ) : null}
          </div>
          <div className="space-y-1 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Impressions</p>
            <p className="text-3xl font-semibold tracking-tight">{kpis.impressions}</p>
            {kpis.impressionsNote ? (
              <p className="text-xs text-muted-foreground">{kpis.impressionsNote}</p>
            ) : null}
          </div>
          <div className="space-y-1 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personnes atteintes</p>
            <p className="text-3xl font-semibold tracking-tight">{kpis.reached}</p>
            {kpis.reachedNote ? (
              <p className="text-xs text-muted-foreground">{kpis.reachedNote}</p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
