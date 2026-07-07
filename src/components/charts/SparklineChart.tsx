"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: { value: number }[];
  color: string;
}

export function SparklineChart({ data, color }: SparklineChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={3}
          dot={false}
          animationDuration={2000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
