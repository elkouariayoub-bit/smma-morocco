"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useDateRange } from "@/app/providers/date-range";

function iso(date?: Date) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function fromISO(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function pretty(date?: Date) {
  return date
    ? date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "";
}

export default function SingleDatePicker() {
  const { range, setRange } = useDateRange();
  const currentDate = React.useMemo(() => fromISO(range.start) ?? new Date(), [range.start]);
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(currentDate);

  const handleSelect = React.useCallback(
    (value?: Date) => {
      setDate(value);
      if (value) {
        const day = iso(value);
        setRange({ start: day, end: day, compare: false });
        setOpen(false);
      }
    },
    [setRange]
  );

  React.useEffect(() => {
    setDate(currentDate);
  }, [currentDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[260px] justify-between">
          <span>{pretty(date) || "Select a date"}</span>
          <span className="ml-2 opacity-60">▾</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="p-2">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={date}
          onSelect={handleSelect}
          className="rounded-md border shadow-sm"
        />
      </PopoverContent>
    </Popover>
  );
}
