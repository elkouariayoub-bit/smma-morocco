"use client";

import * as React from "react";

import SingleDatePicker from "@/components/SingleDatePicker.client";
import { useDateRange } from "@/app/providers/date-range";
import { Button } from "@/components/ui/button";

const PRESETS: Array<{ label: string; days: number }> = [
  { label: "Last 7d", days: 7 },
  { label: "Last 30d", days: 30 },
  { label: "Last 90d", days: 90 },
];

function formatIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function DateRangeToolbar() {
  const { range, setRange } = useDateRange();

  const applyPreset = React.useCallback(
    (days: number) => {
      const end = new Date();
      end.setHours(0, 0, 0, 0);
      const start = new Date(end);
      start.setDate(end.getDate() - (days - 1));

      setRange({
        start: formatIso(start),
        end: formatIso(end),
        compare: range.compare,
      });
    },
    [range.compare, setRange]
  );

  const handleCompareToggle = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRange({ ...range, compare: event.target.checked });
    },
    [range, setRange]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-3">
        <SingleDatePicker />
        <div className="flex items-center gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.days}
              variant="outline"
              type="button"
              onClick={() => applyPreset(preset.days)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <input
          type="checkbox"
          checked={range.compare}
          onChange={handleCompareToggle}
        />
        Compare to previous period
      </label>
    </div>
  );
}
