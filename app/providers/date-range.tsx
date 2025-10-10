"use client";

import * as React from "react";

export type DateRange = {
  start: string;
  end: string;
  compare: boolean;
};

type DateRangeContextValue = {
  range: DateRange;
  setRange: (next: DateRange) => void;
};

const DateRangeContext = React.createContext<DateRangeContextValue | undefined>(
  undefined
);

function todayIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString().slice(0, 10);
}

const defaultRange: DateRange = {
  start: todayIso(),
  end: todayIso(),
  compare: false,
};

export function DateRangeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [range, setRange] = React.useState<DateRange>(defaultRange);

  const value = React.useMemo(
    () => ({
      range,
      setRange,
    }),
    [range]
  );

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = React.useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
}
