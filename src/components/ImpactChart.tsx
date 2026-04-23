"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
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
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          width={35}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          cursor={{ fill: "rgba(0,0,0,0.03)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="Product"
          stackId="a"
          fill={DIMENSION_COLORS.product}
          radius={[0, 0, 0, 0]}
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
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
