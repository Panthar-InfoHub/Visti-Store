"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

interface OrdersComparisonProps {
  data: Array<{
    month: string;
    orders: number;
  }>;
}

export function OrdersComparison({ data }: OrdersComparisonProps) {
  const chartConfig = {
    orders: {
      label: "Orders",
      color: "#06b6d4",
    },
  } satisfies ChartConfig;

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Monthly Orders</CardTitle>
          <CardDescription>No orders yet</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Start receiving orders to see trends</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    month: item.month,
    orders: item.orders,
  }));

  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const avgOrders = (totalOrders / data.length).toFixed(0);

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Monthly Orders</CardTitle>
        <CardDescription>Order volume across months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="orders" fill="#06b6d4" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Average {avgOrders} orders per month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">Total: {totalOrders} orders</div>
      </CardFooter>
    </Card>
  );
}
