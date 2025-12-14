"use server";

import { auth } from "@/lib/auth";
import { prisma as prismaClient } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

// Type assertion for prisma
const prisma = prismaClient as PrismaClient;

interface CalendarEvent {
  id: string;
  title: string;
  type: "task" | "meeting" | "deadline" | "milestone" | "appraisal" | "pto";
  date: Date;
  time?: string;
  priority?: string;
  status?: string;
  description?: string;
}

/**
 * Get all calendar events for the current user
 */
export async function getMyCalendarEvents(startDate?: Date, endDate?: Date) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const start = startDate || new Date();
    const end = endDate || new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Get tasks
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
        dueDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        status: true,
        description: true,
      },
    });

    // Get appraisal cycles
    const appraisals = await prisma.appraisalReview.findMany({
      where: {
        userId: session.user.id,
        cycle: {
          endDate: {
            gte: start,
            lte: end,
          },
        },
      },
      include: {
        cycle: {
          select: {
            name: true,
            endDate: true,
          },
        },
      },
    });

    // Get PTO requests
    const ptoRequests = await prisma.pTORequest.findMany({
      where: {
        userId: session.user.id,
        status: "APPROVED",
        OR: [
          {
            startDate: {
              gte: start,
              lte: end,
            },
          },
          {
            endDate: {
              gte: start,
              lte: end,
            },
          },
        ],
      },
    });

    // Combine all events
    const events: CalendarEvent[] = [
      // Tasks
      ...tasks
        .filter((t: any) => t.dueDate)
        .map((t: any) => ({
          id: `task-${t.id}`,
          title: t.title,
          type: "task" as const,
          date: t.dueDate!,
          priority: t.priority || undefined,
          status: t.status || undefined,
          description: t.description || undefined,
        })),

      // Appraisals
      ...appraisals.map((a: any) => ({
        id: `appraisal-${a.id}`,
        title: `Appraisal: ${a.cycle.name}`,
        type: "appraisal" as const,
        date: a.cycle.endDate,
        status: a.status,
      })),

      // PTO
      ...ptoRequests.flatMap((pto: any) => {
        const events: CalendarEvent[] = [];
        const currentDate = new Date(pto.startDate);
        const endDate = new Date(pto.endDate);

        while (currentDate <= endDate) {
          if (currentDate >= start && currentDate <= end) {
            events.push({
              id: `pto-${pto.id}-${currentDate.toISOString()}`,
              title: `PTO: ${pto.type}`,
              type: "pto" as const,
              date: new Date(currentDate),
              status: pto.status,
              description: pto.reason || undefined,
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return events;
      }),
    ];

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return { success: false, error: "Failed to fetch calendar events" };
  }
}

/**
 * Get events for a specific date
 */
export async function getEventsForDate(date: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await getMyCalendarEvents(startOfDay, endOfDay);

    return result;
  } catch (error) {
    console.error("Error fetching events for date:", error);
    return { success: false, error: "Failed to fetch events for date" };
  }
}

/**
 * Get upcoming events (next 7 days)
 */
export async function getUpcomingEvents() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    return await getMyCalendarEvents(today, nextWeek);
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return { success: false, error: "Failed to fetch upcoming events" };
  }
}

/**
 * Get events for current month
 */
export async function getMonthEvents(year: number, month: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return await getMyCalendarEvents(startOfMonth, endOfMonth);
  } catch (error) {
    console.error("Error fetching month events:", error);
    return { success: false, error: "Failed to fetch month events" };
  }
}

/**
 * Get calendar statistics
 */
export async function getCalendarStats() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const [todayTasks, weekTasks, upcomingDeadlines] = await Promise.all([
      prisma.task.count({
        where: {
          assigneeId: session.user.id,
          dueDate: {
            gte: today,
            lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
          },
        },
      }),
      prisma.task.count({
        where: {
          assigneeId: session.user.id,
          dueDate: {
            gte: today,
            lte: nextWeek,
          },
        },
      }),
      prisma.task.count({
        where: {
          assigneeId: session.user.id,
          status: { not: "DONE" },
          dueDate: {
            gte: today,
            lte: nextWeek,
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        todayTasks,
        weekTasks,
        upcomingDeadlines,
      },
    };
  } catch (error) {
    console.error("Error fetching calendar stats:", error);
    return { success: false, error: "Failed to fetch calendar statistics" };
  }
}

/**
 * Check for PTO on a specific date
 */
export async function checkPTOForDate(date: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const targetDate = new Date(date);

    const ptoRequest = await prisma.pTORequest.findFirst({
      where: {
        userId: session.user.id,
        status: "APPROVED",
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });

    return {
      success: true,
      data: ptoRequest ? { hasPTO: true, pto: ptoRequest } : { hasPTO: false },
    };
  } catch (error) {
    console.error("Error checking PTO for date:", error);
    return { success: false, error: "Failed to check PTO" };
  }
}
