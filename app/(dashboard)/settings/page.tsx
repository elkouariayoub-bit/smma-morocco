"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Update account preferences and manage integrations.
        </p>
      </div>

      {/* Promo / plan card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
              <div>
                <div className="text-sm font-medium">
                  Your application is currently on the free plan
                </div>
                <p className="text-sm text-muted-foreground">
                  Paid plans offer higher usage limits, additional branches, and more.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Chat to us</Button>
                <Button>Upgrade</Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Logo */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-2">
              <Input type="file" className="max-w-sm" />
              <Button variant="outline">Upload</Button>
            </div>
            <p className="text-xs text-muted-foreground">Update your company logo.</p>
          </div>

          {/* System Font */}
          <div className="space-y-2">
            <Label>System Font</Label>
            <div className="max-w-sm">
              <Select defaultValue="inter">
                <SelectTrigger>
                  <SelectValue placeholder="Select Font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="geist">Geist</SelectItem>
                  <SelectItem value="sf">SF Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">Set the font used in the dashboard.</p>
          </div>

          {/* Business Tax ID */}
          <div className="space-y-2">
            <Label>Business Tax ID</Label>
            <div className="flex max-w-sm items-center gap-2">
              <Input placeholder="Business Tax ID" />
              <Button variant="outline">Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
