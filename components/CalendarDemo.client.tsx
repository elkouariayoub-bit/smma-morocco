"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DateRange = {
  from?: Date;
  to?: Date;
};

function formatDate(date: Date | undefined) {
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function CalendarDemo() {
  const today = React.useMemo(() => new Date(), []);
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"single" | "range">("single");
  const [singleDate, setSingleDate] = React.useState<Date>(today);
  const [rangeSelection, setRangeSelection] = React.useState<DateRange>({
    from: today,
    to: today,
  });

  const selected = React.useMemo<DateRange>(() => {
    if (mode === "single") {
      return { from: singleDate, to: singleDate };
    }

    return rangeSelection;
  }, [mode, rangeSelection, singleDate]);

  const handleSelect = React.useCallback(
    (value?: DateRange) => {
      if (!value) return;

      if (mode === "single") {
        const nextDate = value.from ?? value.to;
        if (!nextDate) return;
        setSingleDate(nextDate);
        setOpen(false);
        return;
      }

      if (value.from && value.to) {
        setRangeSelection(value);
        setOpen(false);
      }
    },
    [mode]
  );

  const buttonLabel = React.useMemo(() => {
    if (mode === "single") {
      return formatDate(singleDate);
    }

    const from = formatDate(rangeSelection.from);
    const to = formatDate(rangeSelection.to);

    if (from && to) {
      return `${from} — ${to}`;
    }

    return "Pick a date or range";
  }, [mode, rangeSelection.from, rangeSelection.to, singleDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[240px] justify-between"
          aria-label="Pick a date or range"
        >
          <span>{buttonLabel || "Pick a date or range"}</span>
          <span className="ml-2 opacity-60">▾</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto space-y-4 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Selection mode</span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "single" ? "default" : "outline"}
              onClick={() => setMode("single")}
            >
              Single day
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "range" ? "default" : "outline"}
              onClick={() => setMode("range")}
            >
              Date range
            </Button>
          </div>
        </div>
        <Calendar
          mode={mode}
          selected={selected}
          onSelect={handleSelect}
          className="rounded-md border shadow-sm"
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
