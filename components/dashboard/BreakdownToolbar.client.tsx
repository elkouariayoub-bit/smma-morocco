"use client";

import { useEffect, useState } from "react";
import { useDateRange } from "@/app/providers/date-range";

export type Metric = "engagement_rate" | "impressions" | "people";
export type Breakdown = "gender" | "age" | "geo";
export type Platform = "instagram" | "tiktok" | "facebook" | "x" | "all";

type BreakdownSelection = { metric: Metric; by: Breakdown; platform: Platform };

type BreakdownToolbarProps = {
  value: BreakdownSelection;
  onChange: (value: BreakdownSelection) => void;
};

export default function BreakdownToolbar({ value, onChange }: BreakdownToolbarProps) {
  const { range } = useDateRange();
  const [local, setLocal] = useState<BreakdownSelection>(value);

  useEffect(() => {
    setLocal(value);
  }, [value.metric, value.by, value.platform]);

  function update<K extends keyof BreakdownSelection>(key: K, newValue: BreakdownSelection[K]) {
    if (local[key] === newValue) {
      return;
    }
    const next: BreakdownSelection = { ...local, [key]: newValue };
    setLocal(next);
    onChange(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Metric</span>
        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={local.metric}
          onChange={(event) => update("metric", event.target.value as Metric)}
        >
          <option value="engagement_rate">Engagement rate</option>
          <option value="impressions">Impressions</option>
          <option value="people">People reached</option>
        </select>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Breakdown</span>
        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={local.by}
          onChange={(event) => update("by", event.target.value as Breakdown)}
        >
          <option value="gender">Gender</option>
          <option value="age">Age</option>
          <option value="geo">Geo</option>
        </select>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Platform</span>
        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={local.platform}
          onChange={(event) => update("platform", event.target.value as Platform)}
        >
          <option value="all">All</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="facebook">Facebook</option>
          <option value="x">X</option>
        </select>
      </div>

      <div className="ml-auto text-xs text-muted-foreground">
        Range: {(range.start ?? "—")} → {(range.end ?? "—")}
      </div>
    </div>
  );
}
