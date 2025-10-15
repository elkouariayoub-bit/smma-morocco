"use client";

import { useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  lastSynced: string;
}

type ActivityStatus = "connected" | "disconnected" | "sync";

interface ActivityItem {
  id: string;
  integrationId: string;
  integrationName: string;
  status: ActivityStatus;
  timestamp: string;
}

const initialIntegrations: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Send deployment alerts and post summaries straight to your workspace.",
    connected: true,
    lastSynced: "Synced 2 hours ago",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Keep a living changelog and collaborate on updates with your team.",
    connected: false,
    lastSynced: "Never connected",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Import issues, link pull requests, and sync release notes automatically.",
    connected: true,
    lastSynced: "Synced yesterday",
  },
];

const initialActivity: ActivityItem[] = [
  {
    id: "activity-1",
    integrationId: "github",
    integrationName: "GitHub",
    status: "sync",
    timestamp: "Today at 8:24 AM",
  },
  {
    id: "activity-2",
    integrationId: "slack",
    integrationName: "Slack",
    status: "connected",
    timestamp: "Yesterday at 5:02 PM",
  },
  {
    id: "activity-3",
    integrationId: "notion",
    integrationName: "Notion",
    status: "disconnected",
    timestamp: "Monday at 11:14 AM",
  },
];

function formatStatusLabel(status: ActivityStatus) {
  switch (status) {
    case "connected":
      return "Connected";
    case "disconnected":
      return "Disconnected";
    default:
      return "Synced";
  }
}

export default function ConnectedAppsSettingsPage() {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [activity, setActivity] = useState(initialActivity);

  const connectedCount = useMemo(
    () => integrations.filter((integration) => integration.connected).length,
    [integrations],
  );

  const handleToggleConnection = (integrationId: string) => {
    setIntegrations((prev) => {
      return prev.map((integration) => {
        if (integration.id !== integrationId) {
          return integration;
        }

        const now = new Date();
        const nextConnected = !integration.connected;

        // In production, replace with an API call to update the integration status.
        setActivity((previous) => [
          {
            id: `${integrationId}-${now.getTime()}`,
            integrationId,
            integrationName: integration.name,
            status: nextConnected ? "connected" : "disconnected",
            timestamp: now.toLocaleString(),
          },
          ...previous,
        ]);

        return {
          ...integration,
          connected: nextConnected,
          lastSynced: nextConnected ? `Synced just now` : "Not connected",
        };
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Connected Apps</h1>
        <p className="text-sm text-muted-foreground">
          Manage integrations and control how external tools sync with your workspace.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Integrations</CardTitle>
            <CardDescription>
              Toggle your connected services on or off. Each integration can be configured individually.
            </CardDescription>
          </div>
          <Badge variant="secondary">{connectedCount} connected</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">{integration.name}</h2>
                  <Badge variant={integration.connected ? "secondary" : "outline"}>
                    {integration.connected ? "Connected" : "Not connected"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
                <p className="text-xs text-muted-foreground">{integration.lastSynced}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={integration.connected ? "outline" : "default"}
                  onClick={() => handleToggleConnection(integration.id)}
                >
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
                <Button variant="ghost" className="text-muted-foreground">
                  Configure
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent activity</CardTitle>
          <CardDescription>
            A timeline of connection events. Useful for auditing sync jobs or debugging integration issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activity.map((entry, index) => (
            <div key={entry.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.integrationName}</span>
                  <Badge variant={entry.status === "disconnected" ? "outline" : "secondary"}>
                    {formatStatusLabel(entry.status)}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
              </div>
              {index < activity.length - 1 && <Separator />}
            </div>
          ))}
          {activity.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Connection activity will appear here after you connect an app.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
