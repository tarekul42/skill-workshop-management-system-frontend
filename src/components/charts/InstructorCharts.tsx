"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueDataPoint {
  month: string;
  amount: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  formatCurrency: (value: number) => string;
}

export function RevenueChart({ data, formatCurrency }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{
            fill: "var(--foreground-muted)",
            fontSize: 12,
            fontFamily: "var(--font-body)",
          }}
        />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            fontFamily: "var(--font-display)",
            fontWeight: "700",
          }}
          formatter={(value: number) => [formatCurrency(value), "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="var(--primary)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface EnrollmentDataPoint {
  week: string;
  count: number;
}

interface EnrollmentChartProps {
  data: EnrollmentDataPoint[];
}

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          dataKey="week"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
        />
        <Tooltip
          cursor={{ fill: "var(--surface-3)", radius: 6 }}
          contentStyle={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
          }}
        />
        <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} animationDuration={1500} />
      </BarChart>
    </ResponsiveContainer>
  );
}
