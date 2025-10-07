"use client";

import { memo } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  XAxis,
  CartesianGrid,
} from "recharts";

export type KpiPoint = { label: string; value: number };
export type KpiChartProps = {
  data: KpiPoint[];
  comparison?: KpiPoint[];
  height?: number;
  showGrid?: boolean;
  showAxis?: boolean;
  strokeWidth?: number;
  ariaLabel?: string;
};

function KpiChart({
  data,
  comparison,
  height = 120,
  showGrid = false,
  showAxis = false,
  strokeWidth = 2,
  ariaLabel = "KPI Trend",
}: KpiChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} aria-label={ariaLabel}>
          {showAxis ? <XAxis dataKey="label" tick={{ fontSize: 12 }} /> : <XAxis dataKey="label" hide />}
          {showAxis ? <YAxis tick={{ fontSize: 12 }} /> : <YAxis hide />}
          {showGrid && <CartesianGrid vertical={false} strokeOpacity={0.15} />}
          <Tooltip />
          {comparison && (
            <Line
              type="monotone"
              dataKey="value"
              name="Previous"
              data={comparison}
              stroke="currentColor"
              strokeOpacity={0.35}
              strokeWidth={2}
              dot={false}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            name="Current"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(KpiChart);
