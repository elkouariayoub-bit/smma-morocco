"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Channel = "email" | "push" | "sms";

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  channels: Record<Channel, boolean>;
}

const channelLabels: Record<Channel, string> = {
  email: "Email",
  push: "Push",
  sms: "SMS",
};

const channelOrder: Channel[] = ["email", "push", "sms"];

const initialPreferences: NotificationPreference[] = [
  {
    id: "product-updates",
    title: "Product updates",
    description: "Release notes, feature announcements, and roadmap changes.",
    channels: { email: true, push: false, sms: false },
  },
  {
    id: "activity-alerts",
    title: "Workspace activity",
    description: "Mentions, comments, and assignments triggered by your teammates.",
    channels: { email: true, push: true, sms: false },
  },
  {
    id: "security",
    title: "Security alerts",
    description: "Logins from new devices, password changes, and two-factor prompts.",
    channels: { email: true, push: true, sms: true },
  },
];

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [digestFrequency, setDigestFrequency] = useState("daily");

  const toggleChannel = (preferenceId: string, channel: Channel) => {
    setPreferences((prev) =>
      prev.map((preference) => {
        if (preference.id !== preferenceId) {
          return preference;
        }

        // Replace with API mutation to persist preferences server-side.
        return {
          ...preference,
          channels: {
            ...preference.channels,
            [channel]: !preference.channels[channel],
          },
        };
      }),
    );
  };

  const handleSave = () => {
    // In production, call your notification preferences endpoint here.
    console.log("Saving notification preferences", { preferences, digestFrequency });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Decide how you want to be notified about product updates and workspace activity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Channels</CardTitle>
          <CardDescription>
            Enable the delivery methods that make sense for you. We will respect these defaults for every new event type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {preferences.map((preference) => (
            <div key={preference.id} className="space-y-3 rounded-lg border p-4">
              <div>
                <h2 className="text-base font-semibold">{preference.title}</h2>
                <p className="text-sm text-muted-foreground">{preference.description}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {channelOrder.map((channel) => (
                  <Label key={channel} className="flex items-center gap-2 text-sm font-medium">
                    <Input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={preference.channels[channel]}
                      onChange={() => toggleChannel(preference.id, channel)}
                    />
                    {channelLabels[channel]}
                  </Label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Digest summaries</CardTitle>
          <CardDescription>
            Control how often we compile product updates and analytics into a single message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="digest-frequency">Send digest</Label>
            <Select value={digestFrequency} onValueChange={setDigestFrequency}>
              <SelectTrigger id="digest-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              We bundle non-urgent updates into a digest so your inbox stays focused.
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              Digests arrive in your primary inbox at 9:00 AM in your selected timezone. Change this in your profile
              preferences.
            </p>
            <p>Urgent security events ignore digests and are always delivered immediately.</p>
          </div>
          <Button className="w-fit" onClick={handleSave}>
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
