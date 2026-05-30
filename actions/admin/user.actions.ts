"use server";

import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { USER_ROLE } from "@/prisma/generated/prisma";
import { requireAdmin } from "@/lib/admin-auth";

// Get all users with filtering and pagination
export async function getUsers(filters?: {
  role?: USER_ROLE;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();
  try {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Run count and data fetch in parallel
    const [totalCount, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    // Map to required format without expensive sum calculation
    const usersWithStats = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      totalOrders: user._count.orders,
      totalSpent: 0, // Placeholder as it's not shown in the main table
    }));

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: usersWithStats,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// Get single user with detailed stats
export async function getUser(id: string) {
  try {
    const [user, revenueAggregate] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
          orders: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      }),
      prisma.order.aggregate({
        where: { userId: id, status: { notIn: ["CANCELLED", "FAILED"] } },
        _sum: { total: true },
      }),
    ]);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      data: {
        ...user,
        totalSpent: revenueAggregate._sum.total || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

// Get user statistics
export async function getUserStats() {
  await requireAdmin();

  try {
    const [totalUsers, adminCount, userCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: USER_ROLE.ADMIN } }),
      prisma.user.count({ where: { role: USER_ROLE.USER } }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        adminCount,
        userCount,
      },
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { success: false, error: "Failed to fetch user statistics" };
  }
}

// Update user role (ADMIN only)
export async function updateUserRole(userId: string, newRole: USER_ROLE) {
  await requireAdmin();

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      data: user,
      message: `User role updated to ${newRole} successfully`,
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}
