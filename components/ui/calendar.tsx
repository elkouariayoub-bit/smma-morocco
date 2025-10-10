"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RangeSelection = {
  from?: Date;
  to?: Date;
};

type CalendarBaseProps = {
  className?: string;
};

type SingleModeProps = {
  mode: "single";
  selected?: Date;
  onSelect?: (value?: Date) => void;
};

type RangeModeProps = {
  mode: "range";
  selected?: RangeSelection;
  onSelect?: (value?: RangeSelection) => void;
};

type CalendarProps = CalendarBaseProps & (SingleModeProps | RangeModeProps);

function toInputValue(date?: Date) {
  if (!date) return "";
  const next = new Date(date);
  if (Number.isNaN(next.getTime())) {
    return "";
  }
  next.setHours(0, 0, 0, 0);
  return next.toISOString().slice(0, 10);
}

function fromInputValue(value: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date;
}

export function Calendar(props: CalendarProps & { [key: string]: unknown }) {
  const { className, ...rest } = props;

  if (rest.mode === "single") {
    const { selected, onSelect } = rest;

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <label className="text-xs font-medium text-gray-600" htmlFor="calendar-single">
          Choose a date
        </label>
        <input
          id="calendar-single"
          type="date"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={toInputValue(selected)}
          onChange={(event) => {
            onSelect?.(fromInputValue(event.target.value));
          }}
        />
      </div>
    );
  }

  const { selected, onSelect } = rest;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600" htmlFor="calendar-range-from">
            Start date
          </label>
          <input
            id="calendar-range-from"
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={toInputValue(selected?.from)}
            onChange={(event) => {
              const next = { ...selected, from: fromInputValue(event.target.value) };
              onSelect?.(next);
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600" htmlFor="calendar-range-to">
            End date
          </label>
          <input
            id="calendar-range-to"
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={toInputValue(selected?.to)}
            onChange={(event) => {
              const next = { ...selected, to: fromInputValue(event.target.value) };
              onSelect?.(next);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export type { CalendarProps };
