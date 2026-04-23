"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ScoredEngineer } from "@/lib/types";
import { DIMENSION_COLORS } from "@/lib/constants";

export function ImpactChart({
  engineers,
}: {
  engineers: ScoredEngineer[];
}) {
  const data = engineers.map((eng) => ({
    name: eng.login,
    Product: Math.round(eng.dimensions.product * 10) / 10,
    Leverage: Math.round(eng.dimensions.leverage * 10) / 10,
    Velocity: Math.round(eng.dimensions.velocity * 10) / 10,
    Collaboration: Math.round(eng.dimensions.collaboration * 10) / 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ fontSize: 12 }}
          itemStyle={{ fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="Product"
          stackId="a"
          fill={DIMENSION_COLORS.product}
        />
        <Bar
          dataKey="Leverage"
          stackId="a"
          fill={DIMENSION_COLORS.leverage}
        />
        <Bar
          dataKey="Velocity"
          stackId="a"
          fill={DIMENSION_COLORS.velocity}
        />
        <Bar
          dataKey="Collaboration"
          stackId="a"
          fill={DIMENSION_COLORS.collaboration}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
