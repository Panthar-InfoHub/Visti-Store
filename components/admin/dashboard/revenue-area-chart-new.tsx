"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface RevenueAreaChartProps {
  data: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#8b5cf6", // Vibrant purple
    },
    orders: {
      label: "Orders",
      color: "#06b6d4", // Cyan
    },
  } satisfies ChartConfig;

  // Calculate trend
  const recentRevenue = data.slice(-3).reduce((sum, item) => sum + item.revenue, 0);
  const previousRevenue = data.slice(-6, -3).reduce((sum, item) => sum + item.revenue, 0);
  const trend =
    previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Revenue & Orders Trend</CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <p className="text-muted-foreground">Start receiving orders to see trends</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Revenue & Orders Trend</CardTitle>
        <CardDescription>
          Last 12 months performance - Revenue (left) & Orders (right)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 30,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              yAxisId="left"
              dataKey="revenue"
              type="monotone"
              fill="url(#fillRevenue)"
              stroke="#8b5cf6"
              strokeWidth={2}
            />
            <Area
              yAxisId="right"
              dataKey="orders"
              type="monotone"
              fill="url(#fillOrders)"
              stroke="#06b6d4"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend >= 0 ? "📈" : "📉"} Trending {trend >= 0 ? "up" : "down"} by{" "}
              {Math.abs(trend).toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Last 12 months overview • Revenue only counts successful payments
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
