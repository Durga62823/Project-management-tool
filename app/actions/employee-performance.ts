"use server";

import { auth } from "@/lib/auth";
import { prisma as prismaClient } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

// Type assertion for prisma
const prisma = prismaClient as PrismaClient;

/**
 * Get performance metrics for the current user
 */
export async function getMyPerformanceMetrics(period?: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const metrics = await prisma.performanceMetric.findMany({
      where: {
        userId: session.user.id,
        ...(period && { period }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        recordedAt: "desc",
      },
    });

    return { success: true, data: metrics };
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return { success: false, error: "Failed to fetch performance metrics" };
  }
}

/**
 * Get task completion statistics
 */
export async function getTaskCompletionStats() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [totalTasks, completedTasks, onTimeTasks] = await Promise.all([
      prisma.task.count({
        where: {
          assigneeId: session.user.id,
          createdAt: { gte: currentMonth },
        },
      }),
      prisma.task.count({
        where: {
          assigneeId: session.user.id,
          status: "DONE",
          createdAt: { gte: currentMonth },
        },
      }),
      prisma.task.count({
        where: {
          assigneeId: session.user.id,
          status: "DONE",
          createdAt: { gte: currentMonth },
          updatedAt: { lte: prisma.task.fields.dueDate },
        },
      }),
    ]);

    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const onTimeRate =
      completedTasks > 0 ? (onTimeTasks / completedTasks) * 100 : 0;

    return {
      success: true,
      data: {
        totalTasks,
        completedTasks,
        onTimeTasks,
        completionRate: Math.round(completionRate),
        onTimeRate: Math.round(onTimeRate),
      },
    };
  } catch (error) {
    console.error("Error fetching task completion stats:", error);
    return { success: false, error: "Failed to fetch task statistics" };
  }
}

/**
 * Get time estimation accuracy
 */
export async function getTimeEstimationAccuracy() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
        status: "DONE",
        estimatedHours: { not: null },
        actualHours: { not: null },
      },
      select: {
        estimatedHours: true,
        actualHours: true,
      },
    });

    if (tasks.length === 0) {
      return {
        success: true,
        data: {
          totalEstimated: 0,
          totalActual: 0,
          accuracy: 0,
          variance: 0,
        },
      };
    }

    const totalEstimated = tasks.reduce(
      (sum, t) => sum + (t.estimatedHours || 0),
      0
    );
    const totalActual = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

    const accuracy =
      totalEstimated > 0
        ? Math.min(
            100,
            (1 - Math.abs(totalEstimated - totalActual) / totalEstimated) * 100
          )
        : 0;

    const variance =
      totalEstimated > 0
        ? ((totalActual - totalEstimated) / totalEstimated) * 100
        : 0;

    return {
      success: true,
      data: {
        totalEstimated: Math.round(totalEstimated),
        totalActual: Math.round(totalActual),
        accuracy: Math.round(accuracy),
        variance: Math.round(variance),
      },
    };
  } catch (error) {
    console.error("Error calculating time estimation accuracy:", error);
    return { success: false, error: "Failed to calculate estimation accuracy" };
  }
}

/**
 * Get monthly performance trend
 */
export async function getMonthlyPerformanceTrend(months: number = 12) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - months);

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
        createdAt: { gte: monthsAgo },
      },
      select: {
        status: true,
        createdAt: true,
        updatedAt: true,
        dueDate: true,
      },
    });

    // Group by month
    const monthlyData: Record<
      string,
      { completed: number; total: number; onTime: number }
    > = {};

    tasks.forEach((task) => {
      const monthKey = task.createdAt.toISOString().substring(0, 7); // YYYY-MM

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { completed: 0, total: 0, onTime: 0 };
      }

      monthlyData[monthKey].total++;

      if (task.status === "done") {
        monthlyData[monthKey].completed++;

        if (task.dueDate && task.updatedAt <= task.dueDate) {
          monthlyData[monthKey].onTime++;
        }
      }
    });

    // Convert to array and calculate rates
    const trend = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        completed: data.completed,
        total: data.total,
        completionRate:
          data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        onTimeRate:
          data.completed > 0
            ? Math.round((data.onTime / data.completed) * 100)
            : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { success: true, data: trend };
  } catch (error) {
    console.error("Error fetching performance trend:", error);
    return { success: false, error: "Failed to fetch performance trend" };
  }
}

/**
 * Get performance dashboard summary
 */
export async function getPerformanceDashboard() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [taskStats, estimationAccuracy, recentMetrics] = await Promise.all([
      getTaskCompletionStats(),
      getTimeEstimationAccuracy(),
      getMyPerformanceMetrics("current"),
    ]);

    // Get recent appraisal rating
    const recentAppraisal = await prisma.appraisalReview.findFirst({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
        finalRating: { not: null },
      },
      orderBy: {
        completedAt: "desc",
      },
      select: {
        finalRating: true,
        completedAt: true,
      },
    });

    return {
      success: true,
      data: {
        taskStats: taskStats.success ? taskStats.data : null,
        estimationAccuracy: estimationAccuracy.success
          ? estimationAccuracy.data
          : null,
        recentAppraisal: recentAppraisal
          ? {
              rating: recentAppraisal.finalRating,
              date: recentAppraisal.completedAt,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching performance dashboard:", error);
    return { success: false, error: "Failed to fetch performance dashboard" };
  }
}

/**
 * Get project-wise performance breakdown
 */
export async function getProjectPerformance() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group by project
    const projectData: Record<
      string,
      {
        name: string;
        total: number;
        completed: number;
        inProgress: number;
        estimatedHours: number;
        actualHours: number;
      }
    > = {};

    tasks.forEach((task) => {
      const projectId = task.project?.id || "unassigned";
      const projectName = task.project?.name || "Unassigned";

      if (!projectData[projectId]) {
        projectData[projectId] = {
          name: projectName,
          total: 0,
          completed: 0,
          inProgress: 0,
          estimatedHours: 0,
          actualHours: 0,
        };
      }

      projectData[projectId].total++;

      if (task.status === "done") {
        projectData[projectId].completed++;
      } else if (task.status === "in-progress") {
        projectData[projectId].inProgress++;
      }

      projectData[projectId].estimatedHours += task.estimatedHours || 0;
      projectData[projectId].actualHours += task.actualHours || 0;
    });

    const projectPerformance = Object.entries(projectData).map(
      ([id, data]) => ({
        projectId: id,
        projectName: data.name,
        total: data.total,
        completed: data.completed,
        inProgress: data.inProgress,
        completionRate:
          data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        estimatedHours: Math.round(data.estimatedHours),
        actualHours: Math.round(data.actualHours),
      })
    );

    return { success: true, data: projectPerformance };
  } catch (error) {
    console.error("Error fetching project performance:", error);
    return { success: false, error: "Failed to fetch project performance" };
  }
}
