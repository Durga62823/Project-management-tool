'use server';

import { auth } from '@/lib/auth';
import { prisma as prismaClient } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TimesheetStatus } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

// Type assertion for prisma
const prisma = prismaClient as PrismaClient;

/**
 * Get current week's timesheet for the user
 */
export async function getCurrentTimesheet() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Calculate week start (Monday) and end (Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    let timesheet = await prisma.timesheet.findFirst({
      where: {
        userId: session.user.id,
        weekStart: weekStart,
      },
      include: {
        entries: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    // Create timesheet if doesn't exist
    if (!timesheet) {
      timesheet = await prisma.timesheet.create({
        data: {
          userId: session.user.id,
          weekStart,
          weekEnd,
          totalHours: 0,
          status: TimesheetStatus.DRAFT,
        },
        include: {
          entries: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    }

    return { success: true, data: timesheet };
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    return { success: false, error: 'Failed to fetch timesheet' };
  }
}

/**
 * Add a timesheet entry
 */
export async function addTimesheetEntry(data: {
  date: string;
  projectId: string;
  hours: number;
  description?: string;
  billable?: boolean;
}) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    if (!data.date) {
      return { success: false, error: 'Date is required' };
    }
    if (!data.projectId) {
      return { success: false, error: 'Project is required' };
    }
    if (!data.hours || data.hours <= 0 || data.hours > 24) {
      return { success: false, error: 'Hours must be between 0 and 24' };
    }

    // Get or create timesheet for the week
    const entryDate = new Date(data.date);
    const dayOfWeek = entryDate.getDay();
    const weekStart = new Date(entryDate);
    weekStart.setDate(entryDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    let timesheet = await prisma.timesheet.findFirst({
      where: {
        userId: session.user.id,
        weekStart,
      },
    });

    if (!timesheet) {
      timesheet = await prisma.timesheet.create({
        data: {
          userId: session.user.id,
          weekStart,
          weekEnd,
          totalHours: 0,
          status: TimesheetStatus.DRAFT,
        },
      });
    }

    // Check if timesheet is editable
    if (timesheet.status === TimesheetStatus.APPROVED) {
      return { success: false, error: 'Cannot edit approved timesheet' };
    }

    // Create entry
    const entry = await prisma.timesheetEntry.create({
      data: {
        timesheetId: timesheet.id,
        date: new Date(data.date),
        projectId: data.projectId,
        hours: data.hours,
        description: data.description,
        billable: data.billable ?? false,
      },
    });

    // Update total hours
    const totalHours = await prisma.timesheetEntry.aggregate({
      where: { timesheetId: timesheet.id },
      _sum: { hours: true },
    });

    await prisma.timesheet.update({
      where: { id: timesheet.id },
      data: { totalHours: totalHours._sum.hours || 0 },
    });

    revalidatePath('/employee/timesheet');
    revalidatePath('/employee');

    return { success: true, data: entry };
  } catch (error) {
    console.error('Error adding timesheet entry:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add timesheet entry' 
    };
  }
}

/**
 * Update a timesheet entry
 */
export async function updateTimesheetEntry(
  entryId: string,
  data: {
    hours?: number;
    description?: string;
    billable?: boolean;
  }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify entry belongs to user's timesheet
    const entry = await prisma.timesheetEntry.findFirst({
      where: {
        id: entryId,
        timesheet: {
          userId: session.user.id,
        },
      },
      include: {
        timesheet: true,
      },
    });

    if (!entry) {
      return { success: false, error: 'Entry not found or access denied' };
    }

    if (entry.timesheet.status === TimesheetStatus.APPROVED) {
      return { success: false, error: 'Cannot edit approved timesheet' };
    }

    const updatedEntry = await prisma.timesheetEntry.update({
      where: { id: entryId },
      data,
    });

    // Update total hours
    const totalHours = await prisma.timesheetEntry.aggregate({
      where: { timesheetId: entry.timesheetId },
      _sum: { hours: true },
    });

    await prisma.timesheet.update({
      where: { id: entry.timesheetId },
      data: { totalHours: totalHours._sum.hours || 0 },
    });

    revalidatePath('/employee/timesheet');

    return { success: true, data: updatedEntry };
  } catch (error) {
    console.error('Error updating timesheet entry:', error);
    return { success: false, error: 'Failed to update entry' };
  }
}

/**
 * Delete a timesheet entry
 */
export async function deleteTimesheetEntry(entryId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify entry belongs to user's timesheet
    const entry = await prisma.timesheetEntry.findFirst({
      where: {
        id: entryId,
        timesheet: {
          userId: session.user.id,
        },
      },
      include: {
        timesheet: true,
      },
    });

    if (!entry) {
      return { success: false, error: 'Entry not found or access denied' };
    }

    if (entry.timesheet.status === TimesheetStatus.APPROVED) {
      return { success: false, error: 'Cannot delete from approved timesheet' };
    }

    await prisma.timesheetEntry.delete({
      where: { id: entryId },
    });

    // Update total hours
    const totalHours = await prisma.timesheetEntry.aggregate({
      where: { timesheetId: entry.timesheetId },
      _sum: { hours: true },
    });

    await prisma.timesheet.update({
      where: { id: entry.timesheetId },
      data: { totalHours: totalHours._sum.hours || 0 },
    });

    revalidatePath('/employee/timesheet');

    return { success: true };
  } catch (error) {
    console.error('Error deleting timesheet entry:', error);
    return { success: false, error: 'Failed to delete entry' };
  }
}

/**
 * Submit timesheet for approval
 */
export async function submitTimesheet(timesheetId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify timesheet belongs to user
    const timesheet = await prisma.timesheet.findFirst({
      where: {
        id: timesheetId,
        userId: session.user.id,
      },
    });

    if (!timesheet) {
      return { success: false, error: 'Timesheet not found or access denied' };
    }

    if (timesheet.status !== TimesheetStatus.DRAFT) {
      return { success: false, error: 'Timesheet is not in draft status' };
    }

    const updatedTimesheet = await prisma.timesheet.update({
      where: { id: timesheetId },
      data: { 
        status: TimesheetStatus.SUBMITTED,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/employee/timesheet');

    return { success: true, data: updatedTimesheet };
  } catch (error) {
    console.error('Error submitting timesheet:', error);
    return { success: false, error: 'Failed to submit timesheet' };
  }
}

/**
 * Get timesheet history
 */
export async function getTimesheetHistory(limit: number = 10) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const timesheets = await prisma.timesheet.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        entries: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        weekStart: 'desc',
      },
      take: limit,
    });

    return { success: true, data: timesheets };
  } catch (error) {
    console.error('Error fetching timesheet history:', error);
    return { success: false, error: 'Failed to fetch timesheet history' };
  }
}

/**
 * Get timesheet statistics
 */
export async function getTimesheetStats() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [totalHours, billableHours] = await Promise.all([
      prisma.timesheetEntry.aggregate({
        where: {
          timesheet: {
            userId: session.user.id,
          },
          date: {
            gte: currentMonth,
          },
        },
        _sum: {
          hours: true,
        },
      }),
      prisma.timesheetEntry.aggregate({
        where: {
          timesheet: {
            userId: session.user.id,
          },
          date: {
            gte: currentMonth,
          },
          billable: true,
        },
        _sum: {
          hours: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalHours: totalHours._sum.hours || 0,
        billableHours: billableHours._sum.hours || 0,
        nonBillableHours: (totalHours._sum.hours || 0) - (billableHours._sum.hours || 0),
      },
    };
  } catch (error) {
    console.error('Error fetching timesheet stats:', error);
    return { success: false, error: 'Failed to fetch statistics' };
  }
}

/**
 * Get available projects for timesheet entry
 */
export async function getAvailableProjects() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all active projects (simplified to show all projects for timesheet entry)
    const projects = await prisma.project.findMany({
      where: {
        status: {
          not: 'COMPLETED', // Exclude completed projects
        },
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return { success: true, data: projects };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { success: false, error: 'Failed to fetch projects' };
  }
}
