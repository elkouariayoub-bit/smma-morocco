"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function BarPanel() {
  const data = Array.from({ length: 12 }, (_, i) => ({
    m: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i],
    v: Math.round(100 + Math.random() * 140),
  }));

  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader>
        <CardTitle>Subscriptions</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeOpacity={0.1} />
            <XAxis dataKey="m" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="v" fill="currentColor" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
