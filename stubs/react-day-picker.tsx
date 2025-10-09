"use client";

import * as React from "react";

export type DateRange = { from?: Date; to?: Date };

export type DayPickerBaseProps = {
  mode?: "single" | "range";
  selected?: Date | DateRange;
  onSelect?: (value: Date | DateRange | undefined) => void;
  className?: string;
  numberOfMonths?: number;
  captionLayout?: "buttons" | "dropdown";
  showOutsideDays?: boolean;
  classNames?: Record<string, string>;
  modifiers?: Record<string, unknown>;
  fromYear?: number;
  toYear?: number;
  initialFocus?: boolean;
};

function toISO(date?: Date) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function fromISO(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

export function DayPicker({
  mode = "range",
  selected,
  onSelect,
  className,
}: DayPickerBaseProps) {
  if (mode === "single") {
    const value = selected instanceof Date ? toISO(selected) : "";
    return (
      <div className={className} data-stub="react-day-picker-single">
        <label className="text-sm font-medium text-foreground">Date</label>
        <input
          type="date"
          value={value}
          onChange={(event) => {
            const next = fromISO(event.target.value);
            onSelect?.(next ?? undefined);
          }}
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>
    );
  }

  const range = (selected as DateRange) || {};
  const startValue = toISO(range.from);
  const endValue = toISO(range.to ?? range.from);

  return (
    <div className={className} data-stub="react-day-picker-range">
      <div className="flex flex-col gap-3">
        <div className="grid gap-1">
          <span className="text-sm font-medium text-foreground">Start date</span>
          <input
            type="date"
            value={startValue}
            onChange={(event) => {
              const from = fromISO(event.target.value);
              const to = range.to ?? from;
              onSelect?.({ from, to });
            }}
            className="rounded-md border px-3 py-2"
          />
        </div>
        <div className="grid gap-1">
          <span className="text-sm font-medium text-foreground">End date</span>
          <input
            type="date"
            value={endValue}
            onChange={(event) => {
              const from = range.from ?? fromISO(event.target.value);
              const to = fromISO(event.target.value);
              onSelect?.({ from, to });
            }}
            className="rounded-md border px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}

export type DayPickerRangeProps = DayPickerBaseProps & { selected?: DateRange };
export type DayPickerSingleProps = DayPickerBaseProps & { selected?: Date };

export type SelectRangeEventHandler = (range: DateRange | undefined) => void;
export type SelectSingleEventHandler = (day: Date | undefined) => void;

export const __STUB__ = true;
