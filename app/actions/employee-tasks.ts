'use server';

import { auth } from '@/lib/auth';
import { prisma as prismaClient } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { PrismaClient } from '@prisma/client';

// Type assertion for prisma
const prisma = prismaClient as PrismaClient;

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | null;
  projectId?: string | null;
  assigneeId?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  createdAt: Date;
  updatedAt: Date;
  project?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Create a new task
 */
export async function createTask(data: {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId?: string;
  dueDate?: string;
  estimatedHours?: number;
}) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        projectId: data.projectId || null,
        assigneeId: session.user.id, // Assign to self
        reporterId: session.user.id, // Reporter is also self
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedHours: data.estimatedHours || null,
        status: 'TODO',
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

    revalidatePath('/employee/my-work');
    revalidatePath('/employee');

    return { success: true, data: task as Task };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}

/**
 * Get all tasks assigned to the current user
 */
export async function getMyTasks() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
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
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return { 
      success: true, 
      data: tasks as Task[] 
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { success: false, error: 'Failed to fetch tasks' };
  }
}

/**
 * Get task statistics for the current user
 */
export async function getMyTaskStats() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const [total, inProgress, completed, overdue] = await Promise.all([
      prisma.task.count({
        where: { assigneeId: session.user.id },
      }),
      prisma.task.count({
        where: { 
          assigneeId: session.user.id,
          status: 'IN_PROGRESS',
        },
      }),
      prisma.task.count({
        where: { 
          assigneeId: session.user.id,
          status: 'DONE',
        },
      }),
      prisma.task.count({
        where: { 
          assigneeId: session.user.id,
          status: { not: 'DONE' },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return { 
      success: true, 
      data: {
        total,
        inProgress,
        completed,
        overdue,
      }
    };
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return { success: false, error: 'Failed to fetch task statistics' };
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'BLOCKED' | 'DONE') {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify task belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        assigneeId: session.user.id,
      },
    });

    if (!task) {
      return { success: false, error: 'Task not found or access denied' };
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { 
        status,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/employee/my-work');
    revalidatePath('/employee');

    return { success: true, data: updatedTask };
  } catch (error) {
    console.error('Error updating task status:', error);
    return { success: false, error: 'Failed to update task status' };
  }
}

/**
 * Log hours for a task
 */
export async function logTaskHours(taskId: string, hours: number) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify task belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        assigneeId: session.user.id,
      },
    });

    if (!task) {
      return { success: false, error: 'Task not found or access denied' };
    }

    const currentHours = task.actualHours || 0;
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { 
        actualHours: currentHours + hours,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/employee/my-work');

    return { success: true, data: updatedTask };
  } catch (error) {
    console.error('Error logging task hours:', error);
    return { success: false, error: 'Failed to log hours' };
  }
}

/**
 * Get tasks filtered by criteria
 */
export async function getFilteredTasks(filter: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);

    let whereClause: any = {
      assigneeId: session.user.id,
    };

    switch (filter) {
      case 'today':
        whereClause.dueDate = {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lte: new Date(today.setHours(23, 59, 59, 999)),
        };
        break;
      case 'week':
        whereClause.dueDate = {
          gte: today,
          lte: weekFromNow,
        };
        break;
      case 'overdue':
        whereClause.dueDate = { lt: new Date() };
        whereClause.status = { not: 'DONE' };
        break;
      case 'blocked':
        whereClause.status = 'BLOCKED';
        break;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return { success: true, data: tasks as Task[] };
  } catch (error) {
    console.error('Error fetching filtered tasks:', error);
    return { success: false, error: 'Failed to fetch filtered tasks' };
  }
}
