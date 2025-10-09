"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={(value) => {
        if (value instanceof Date || value === undefined) {
          setDate(value)
        } else if (value?.from instanceof Date) {
          setDate(value.from)
        }
      }}
      className="rounded-md border shadow-sm"
      captionLayout="dropdown"
    />
  );
}
