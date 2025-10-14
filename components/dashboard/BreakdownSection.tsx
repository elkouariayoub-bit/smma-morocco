"use client";
import { useState } from "react";
import BreakdownToolbar, {
  type Breakdown,
  type Metric,
  type Platform,
} from "./BreakdownToolbar.client";
import BreakdownPanel from "./BreakdownPanel.client";

type Selection = { metric: Metric; by: Breakdown; platform: Platform };

const DEFAULT_SELECTION: Selection = {
  metric: "impressions",
  by: "gender",
  platform: "all",
};

export default function BreakdownSection() {
  const [state, setState] = useState<Selection>(DEFAULT_SELECTION);

  return (
    <section className="space-y-4">
      <BreakdownToolbar value={state} onChange={setState} />
      <BreakdownPanel metric={state.metric} by={state.by} platform={state.platform} />
    </section>
  );
}
