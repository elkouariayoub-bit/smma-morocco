"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";

type StatPoint = { v: number };

type StatCardProps = {
  title: string;
  value: string;
  sublabel?: string;
  delta?: string;
  data?: StatPoint[];
  accentClassName?: string;
};

export default function StatCard({
  title,
  value,
  sublabel,
  delta,
  data = [],
  accentClassName = "text-blue-600",
}: StatCardProps) {
  return (
    <Card className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {sublabel ? <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div> : null}
        {delta ? <div className="mt-2 text-xs">{delta}</div> : null}
        <div className={`mt-4 h-10 ${accentClassName}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line type="monotone" dataKey="v" stroke="currentColor" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
