"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AreaPanel() {
  const data = useMemo(
    () =>
      MONTHS.map((month, index) => ({
        m: month,
        a: 200 + Math.random() * 200 + index * 5,
        b: 120 + Math.random() * 180 + index * 3,
      })),
    []
  );

  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader>
        <CardTitle>Sale Activity – Monthly</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} aria-label="Monthly sales activity">
            <defs>
              <linearGradient id="area-a" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="currentColor" stopOpacity={0.35} />
                <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.1} />
            <XAxis dataKey="m" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="a" stroke="currentColor" fill="url(#area-a)" />
            <Area type="monotone" dataKey="b" stroke="currentColor" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
