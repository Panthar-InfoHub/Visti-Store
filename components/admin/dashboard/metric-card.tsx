"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  sparklineData: Array<{ value: number }>;
  color: string;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  change,
  sparklineData,
  color,
  subtitle,
}: MetricCardProps) {
  const isPositive = change >= 0;

  // Extract color based on Tailwind class
  const getColorValue = (colorClass: string) => {
    if (colorClass.includes("blue")) return "#3b82f6";
    if (colorClass.includes("emerald")) return "#10b981";
    if (colorClass.includes("purple")) return "#8b5cf6";
    if (colorClass.includes("orange")) return "#f59e0b";
    return "#3b82f6"; // default
  };

  const colorValue = getColorValue(color);

  return (
    <div className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {change !== 0 && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              isPositive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="mb-3">
        <h3 className={`text-3xl font-bold tracking-tight ${color}`}>{value}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {sparklineData.length > 0 && (
        <div className="h-12 w-full mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={colorValue}
                strokeWidth={2}
                fill="none"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
