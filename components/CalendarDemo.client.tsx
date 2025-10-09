"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

type CalendarRange = {
  from?: Date;
  to?: Date;
};

export default function CalendarDemo() {
  const [selection, setSelection] = React.useState<CalendarRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const handleSelect = React.useCallback((value?: CalendarRange) => {
    setSelection(value);
  }, []);

  return (
    <Calendar
      mode="single"
      selected={selection}
      onSelect={handleSelect}
      className="rounded-md border shadow-sm"
      captionLayout="dropdown"
    />
  );
}
