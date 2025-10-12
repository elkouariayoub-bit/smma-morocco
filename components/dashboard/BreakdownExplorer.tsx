"use client";

import { useState } from "react";

import BreakdownToolbar, {
  type Breakdown,
  type Metric,
  type Platform,
} from "@/components/dashboard/BreakdownToolbar";
import BreakdownPanel from "@/components/dashboard/BreakdownPanel";

const DEFAULT_SELECTION: { metric: Metric; by: Breakdown; platform: Platform } = {
  metric: "impressions",
  by: "gender",
  platform: "all",
};

export default function BreakdownExplorer() {
  const [selection, setSelection] = useState(DEFAULT_SELECTION);

  return (
    <div className="space-y-4">
      <BreakdownToolbar value={selection} onChange={setSelection} />
      <BreakdownPanel
        metric={selection.metric}
        by={selection.by}
        platform={selection.platform}
      />
    </div>
  );
}
