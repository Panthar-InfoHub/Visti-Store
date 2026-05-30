  "use client";

  import { MetricCard } from "./metric-card";
  import { formatCurrency } from "@/utils/format";

  interface DashboardStatsProps {
    stats: {
      totalRevenue: number;
      totalOrders: number;
      totalCustomers: number;
      totalProducts: number;
      revenueChange: number;
      ordersChange: number;
      customersChange: number;
      productsChange: number;
      todayRevenue: number;
      todayOrders: number;
    };
    timeFilter?: "today" | "30days" | "90days" | "lifetime";
  }

  // Generate sparkline data for visual interest
  const generateSparkline = (value: number, trend: number) => {
    const baseValue = value / 12;
    const data = [];
    for (let i = 0; i < 12; i++) {
      const variance = Math.random() * 0.3 - 0.15;
      const trendFactor = (trend / 100) * (i / 11);
      data.push({
        value: baseValue * (1 + variance + trendFactor),
      });
    }
    return data;
  };

  export function DashboardStats({ stats, timeFilter = "30days" }: DashboardStatsProps) {
    const isToday = timeFilter === "today";

    const cards = [
      {
        title: isToday ? "Today's Revenue" : "Revenue",
        value: formatCurrency(stats.totalRevenue),
        change: stats.revenueChange,
        color: "text-blue-600 dark:text-blue-400",
        sparklineData: generateSparkline(stats.totalRevenue, stats.revenueChange),
        subtitle: isToday ? undefined : `Today: ${formatCurrency(stats.todayRevenue)}`,
      },
      {
        title: "Total Orders",
        value: stats.totalOrders.toLocaleString(),
        change: stats.ordersChange,
        color: "text-emerald-600 dark:text-emerald-400",
        sparklineData: generateSparkline(stats.totalOrders, stats.ordersChange),
        subtitle: isToday ? undefined : `Today: ${stats.todayOrders}`,
      },
      {
        title: "Total Customers",
        value: stats.totalCustomers.toLocaleString(),
        change: stats.customersChange,
        color: "text-purple-600 dark:text-purple-400",
        sparklineData: generateSparkline(stats.totalCustomers, stats.customersChange),
      },
      {
        title: "Products",
        value: stats.totalProducts.toLocaleString(),
        change: stats.productsChange,
        color: "text-orange-600 dark:text-orange-400",
        sparklineData: generateSparkline(stats.totalProducts, stats.productsChange),
      },
    ];

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            sparklineData={card.sparklineData}
            color={card.color}
            subtitle={card.subtitle}
          />
        ))}
      </div>
    );
  }
