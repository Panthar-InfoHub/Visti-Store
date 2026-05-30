"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getOrdersByStatus } from "@/actions/admin/dashboard.actions";

interface OrderStatusChartProps {
  data?: Array<{
    status: string;
    count: number;
  }>;
}

const chartConfig = {
  count: {
    label: "Orders",
  },
  PENDING: {
    label: "Pending",
    color: "#f59e0b", // Amber
  },
  PROCESSING: {
    label: "Processing",
    color: "#3b82f6", // Blue
  },
  SHIPPED: {
    label: "Shipped",
    color: "#8b5cf6", // Purple
  },
  DELIVERED: {
    label: "Delivered",
    color: "#10b981", // Green
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#6b7280", // Gray
  },
  FAILED: {
    label: "Failed",
    color: "#ef4444", // Red
  },
} satisfies ChartConfig;

export function OrderStatusChart({ data: initialData }: OrderStatusChartProps) {
  const [data, setData] = useState(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    if (!initialData) {
      getOrdersByStatus()
        .then((result) => {
          if (result.success && result.data) {
            setData(result.data);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [initialData]);

  if (isLoading) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading order status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
          <CardDescription>No orders yet</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No orders to display</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    status: item.status,
    count: item.count,
    fill: `var(--color-${item.status})`,
  }));

  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Order Status Distribution</CardTitle>
        <CardDescription>Current orders by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 20,
            }}
          >
            <YAxis
              dataKey="status"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label || value
              }
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" radius={5} />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Total: {totalOrders} orders
        </div>
      </CardContent>
    </Card>
  );
}
