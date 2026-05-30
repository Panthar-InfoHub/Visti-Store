"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
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

interface CategoryPerformanceProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function CategoryPerformance({ data }: CategoryPerformanceProps) {
  const chartConfig = {
    value: {
      label: "Products",
      color: "#8b5cf6",
    },
  } satisfies ChartConfig;

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>No categories yet</CardDescription>
        </CardHeader>
        <CardContent className="aspect-square max-h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Add categories to see distribution</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
        <CardDescription>Product distribution across categories</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <RadarChart data={data} className="overflow-visible!">
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="name" className=""/>
            <PolarGrid className="fill-muted/50" />
            <Radar
              dataKey="value"
              fill="#8b5cf6"
              fillOpacity={0.6}
              stroke="#8b5cf6"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Balanced product distribution <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          Total categories: {data.length}
        </div>
      </CardFooter>
    </Card>
  );
}
