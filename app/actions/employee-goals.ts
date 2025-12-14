'use server';

import { auth } from '@/lib/auth';
import { prisma as prismaClient } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { PrismaClient } from '@prisma/client';

// Type assertion for prisma
const prisma = prismaClient as PrismaClient;

/**
 * Get all goals for the current user
 */
export async function getMyGoals() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { status: 'asc' },
        { targetDate: 'asc' },
      ],
    });

    return { success: true, data: goals };
  } catch (error) {
    console.error('Error fetching goals:', error);
    return { success: false, error: 'Failed to fetch goals' };
  }
}

/**
 * Create a new goal
 */
export async function createGoal(data: {
  title: string;
  description?: string;
  targetDate?: string;
  category?: string;
  priority?: string;
}) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        progress: 0,
        status: 'active',
      },
    });

    revalidatePath('/employee/goals');
    revalidatePath('/employee');

    return { success: true, data: goal };
  } catch (error) {
    console.error('Error creating goal:', error);
    return { success: false, error: 'Failed to create goal' };
  }
}

/**
 * Update a goal
 */
export async function updateGoal(
  goalId: string,
  data: {
    title?: string;
    description?: string;
    targetDate?: string;
    progress?: number;
    status?: string;
  }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id,
      },
    });

    if (!goal) {
      return { success: false, error: 'Goal not found or access denied' };
    }

    const updateData: any = { ...data };
    if (data.targetDate) {
      updateData.targetDate = new Date(data.targetDate);
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });

    revalidatePath('/employee/goals');
    revalidatePath('/employee');

    return { success: true, data: updatedGoal };
  } catch (error) {
    console.error('Error updating goal:', error);
    return { success: false, error: 'Failed to update goal' };
  }
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(goalId: string, progress: number) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id,
      },
    });

    if (!goal) {
      return { success: false, error: 'Goal not found or access denied' };
    }

    // Ensure progress is between 0 and 100
    const validProgress = Math.max(0, Math.min(100, progress));

    // Automatically update status based on progress
    let status = goal.status;
    if (validProgress >= 100) {
      status = 'completed';
    } else if (validProgress > 0 && status === 'active') {
      status = 'in-progress';
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: { 
        progress: validProgress,
        status,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/employee/goals');

    return { success: true, data: updatedGoal };
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id,
      },
    });

    if (!goal) {
      return { success: false, error: 'Goal not found or access denied' };
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });

    revalidatePath('/employee/goals');
    revalidatePath('/employee');

    return { success: true };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return { success: false, error: 'Failed to delete goal' };
  }
}

/**
 * Get goal statistics
 */
export async function getGoalStats() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const [total, active, completed, inProgress] = await Promise.all([
      prisma.goal.count({
        where: { userId: session.user.id },
      }),
      prisma.goal.count({
        where: { 
          userId: session.user.id,
          status: 'active',
        },
      }),
      prisma.goal.count({
        where: { 
          userId: session.user.id,
          status: 'completed',
        },
      }),
      prisma.goal.count({
        where: { 
          userId: session.user.id,
          status: 'in-progress',
        },
      }),
    ]);

    // Calculate average progress
    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      select: { progress: true },
    });

    const avgProgress = goals.length > 0
      ? goals.reduce((sum: number, g: any) => sum + g.progress, 0) / goals.length
      : 0;

    return {
      success: true,
      data: {
        total,
        active,
        completed,
        inProgress,
        avgProgress: Math.round(avgProgress),
      },
    };
  } catch (error) {
    console.error('Error fetching goal stats:', error);
    return { success: false, error: 'Failed to fetch goal statistics' };
  }
}

/**
 * Get goals filtered by status or category
 */
export async function getFilteredGoals(filter: {
  status?: string;
  category?: string;
}) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const whereClause: any = {
      userId: session.user.id,
    };

    if (filter.status) {
      whereClause.status = filter.status;
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
      orderBy: [
        { status: 'asc' },
        { targetDate: 'asc' },
      ],
    });

    return { success: true, data: goals };
  } catch (error) {
    console.error('Error fetching filtered goals:', error);
    return { success: false, error: 'Failed to fetch filtered goals' };
  }
}
