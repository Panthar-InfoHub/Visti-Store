"use server";

import { prisma } from "@/prisma/db";

// Get dashboard statistics with time filter
export async function getDashboardStats(
  timeFilter: "today" | "30days" | "90days" | "lifetime" = "today"
) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Determine date range based on filter
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    if (timeFilter === "today") {
      startDate = startOfToday;
      // Previous day for comparison
      previousStartDate = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      previousEndDate = startOfToday;
    } else if (timeFilter === "30days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      previousEndDate = startDate;
    } else if (timeFilter === "90days") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      previousEndDate = startDate;
    } else {
      // Lifetime
      startDate = new Date(0); // Beginning of time
      previousStartDate = new Date(0);
      previousEndDate = new Date(0);
    }

    // Get stats for current period and previous period
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      previousRevenue,
      todayRevenue,
      todayOrders,
    ] = await Promise.all([
      // Total revenue - count all non-cancelled/non-failed orders (time-filtered)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ["CANCELLED", "FAILED"] },
        },
        _sum: { total: true },
      }),
      // Total orders - ALL orders ever (not time-filtered)
      prisma.order.count(),
      // Total customers - ALL customers ever (not time-filtered)
      prisma.user.count({
        where: { role: "USER" },
      }),
      // Total products
      prisma.product.count(),
      // Previous period revenue - non-cancelled/non-failed (for comparison)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate },
          status: { notIn: ["CANCELLED", "FAILED"] },
        },
        _sum: { total: true },
      }),
      // Today's stats - non-cancelled/non-failed
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfToday },
          status: { notIn: ["CANCELLED", "FAILED"] },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
    ]);

    // Calculate percentage changes
    const revenueChange =
      timeFilter === "lifetime"
        ? 0
        : calculatePercentageChange(previousRevenue._sum.total || 0, totalRevenue._sum.total || 0);
    // Orders and Customers now show totals, so no growth percentage
    const ordersChange = 0;
    const customersChange = 0;

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueChange,
        ordersChange,
        customersChange,
        productsChange: 0,
        // Today's stats
        todayRevenue: todayRevenue._sum.total || 0,
        todayOrders,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard statistics" };
  }
}

// Get revenue data for charts (last 12 months)
export async function getRevenueData() {
  try {
    const now = new Date();

    // Create an array of promises for each of the last 12 months
    const monthPromises = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = 11 - i;
      const date = new Date(now.getFullYear(), now.getMonth() - monthIndex, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - monthIndex + 1, 1);

      return (async () => {
        const [revenue, orders] = await Promise.all([
          prisma.order.aggregate({
            where: {
              createdAt: { gte: date, lt: nextDate },
              status: { notIn: ["CANCELLED", "FAILED"] },
            },
            _sum: { total: true },
          }),
          prisma.order.count({
            where: {
              createdAt: { gte: date, lt: nextDate },
            },
          }),
        ]);

        return {
          month: date.toLocaleString("default", { month: "short" }),
          revenue: revenue._sum.total || 0,
          orders,
          timestamp: date.getTime(), // For sorting later
        };
      })();
    });

    const months = await Promise.all(monthPromises);

    // Sort by timestamp to ensure chronological order
    months.sort((a, b) => a.timestamp - b.timestamp);

    // Remove internal timestamp before returning
    const finalData = months.map(({ month, revenue, orders }) => ({
      month,
      revenue,
      orders,
    }));

    return { success: true, data: finalData };
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return { success: false, error: "Failed to fetch revenue data" };
  }
}

// Get category distribution for pie chart
export async function getCategoryDistribution() {
  try {
    // only parent category with products count
    const categories = await prisma.category.findMany({
      where: {
        parent: null,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const data = categories.map((cat) => ({
      name: cat.name,
      value: cat._count.products,
      color: generateColorForCategory(cat.name),
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching category distribution:", error);
    return { success: false, error: "Failed to fetch category distribution" };
  }
}

// Get top selling products
export async function getTopProducts(limit: number = 5) {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit,
    });

    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            images: true,
            sellingPrice: true,
          },
        },
      },
    });

    const data = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const primaryVariant = product?.variants?.[0];
      return {
        id: item.productId,
        title: product?.title || "Unknown",
        sales: item._sum.quantity || 0,
        orders: item._count.productId,
        image: primaryVariant?.images?.[0] || "/placeholder.svg",
        sellingPrice: primaryVariant?.sellingPrice || 0,
        category: product?.category?.name || "Unknown",
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching top products:", error);
    return { success: false, error: "Failed to fetch top products" };
  }
}

// Helper function to calculate percentage change
function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
}

// Get order stats by status
export async function getOrdersByStatus(timeFilter: "30days" | "90days" | "lifetime" = "30days") {
  try {
    const now = new Date();
    let startDate: Date;

    if (timeFilter === "30days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "90days") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(0);
    }

    const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED"];

    const groupResults = await prisma.order.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: startDate },
      },
      _count: {
        _all: true,
      },
    });

    // Map the results back to ensuring all statuses are represented
    const statusCounts = statuses.map((status) => {
      const result = groupResults.find((r) => r.status === status);
      return {
        status,
        count: result?._count?._all || 0,
      };
    });

    return { success: true, data: statusCounts };
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    return { success: false, error: "Failed to fetch order status data" };
  }
}

// Helper function to generate consistent colors for categories
function generateColorForCategory(name: string): string {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
