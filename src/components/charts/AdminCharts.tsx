"use client";

import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "var(--primary)",
  "var(--chart-2, #f59e0b)",
  "var(--chart-3, #10b981)",
  "var(--chart-4, #8b5cf6)",
  "var(--chart-5, #ec4899)",
];

interface ChartDataPoint {
  name: string;
  value: number;
}

interface DistributionRole {
  name: string;
  value: number;
}

interface PerformanceTrendChartProps {
  data: ChartDataPoint[];
}

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        No trend data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-md)",
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--primary)"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorMain)"
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface UserDistributionChartProps {
  roles: DistributionRole[];
}

export function UserDistributionChart({ roles }: UserDistributionChartProps) {
  if (roles.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        No user data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={roles}
          innerRadius={65}
          outerRadius={85}
          paddingAngle={10}
          dataKey="value"
          animationDuration={1500}
        >
          {roles.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-md)",
          }}
        />
        <Legend iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}
