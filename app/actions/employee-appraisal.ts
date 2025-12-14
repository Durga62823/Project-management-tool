'use server';

import { auth } from '@/lib/auth';
import { prisma as prismaClient } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AppraisalStatus } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

// Type assertion for prisma
const prisma = prismaClient as PrismaClient;

/**
 * Get all appraisals for the current user
*/
export async function getMyAppraisals() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const appraisals = await prisma.appraisalReview.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        cycle: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: appraisals };
  } catch (error) {
    console.error('Error fetching appraisals:', error);
    return { success: false, error: 'Failed to fetch appraisals' };
  }
}

/**
 * Get current/active appraisal
 */
export async function getCurrentAppraisal() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Find active appraisal cycle
    const activeCycle = await prisma.appraisalCycle.findFirst({
      where: {
        status: {
          in: [AppraisalStatus.DRAFT, AppraisalStatus.IN_PROGRESS],
        },
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (!activeCycle) {
      return { success: true, data: null };
    }

    // Get or create user's appraisal for this cycle
    let appraisal = await prisma.appraisalReview.findFirst({
      where: {
        cycleId: activeCycle.id,
        userId: session.user.id,
      },
      include: {
        cycle: true,
      },
    });

    if (!appraisal) {
      appraisal = await prisma.appraisalReview.create({
        data: {
          cycleId: activeCycle.id,
          userId: session.user.id,
          status: AppraisalStatus.DRAFT,
        },
        include: {
          cycle: true,
        },
      });
    }

    return { success: true, data: appraisal };
  } catch (error) {
    console.error('Error fetching current appraisal:', error);
    return { success: false, error: 'Failed to fetch current appraisal' };
  }
}

/**
 * Update self-review
 */
export async function updateSelfReview(
  appraisalId: string,
  selfReview: string,
  rating?: number
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify appraisal belongs to user
    const appraisal = await prisma.appraisalReview.findFirst({
      where: {
        id: appraisalId,
        userId: session.user.id,
      },
    });

    if (!appraisal) {
      return { success: false, error: 'Appraisal not found or access denied' };
    }

    if (appraisal.status === AppraisalStatus.COMPLETED) {
      return { success: false, error: 'Cannot edit completed appraisal' };
    }

    const updateData: any = {
      selfReview,
      updatedAt: new Date(),
    };

    if (rating !== undefined) {
      updateData.rating = rating;
    }

    const updatedAppraisal = await prisma.appraisalReview.update({
      where: { id: appraisalId },
      data: updateData,
    });

    revalidatePath('/employee/appraisal');

    return { success: true, data: updatedAppraisal };
  } catch (error) {
    console.error('Error updating self-review:', error);
    return { success: false, error: 'Failed to update self-review' };
  }
}

/**
 * Submit appraisal for manager review
 */
export async function submitAppraisal(appraisalId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify appraisal belongs to user
    const appraisal = await prisma.appraisalReview.findFirst({
      where: {
        id: appraisalId,
        userId: session.user.id,
      },
    });

    if (!appraisal) {
      return { success: false, error: 'Appraisal not found or access denied' };
    }

    if (appraisal.status !== AppraisalStatus.DRAFT) {
      return { success: false, error: 'Appraisal is not in draft status' };
    }

    if (!appraisal.selfReview) {
      return { success: false, error: 'Self-review is required before submission' };
    }

    const updatedAppraisal = await prisma.appraisalReview.update({
      where: { id: appraisalId },
      data: {
        status: AppraisalStatus.IN_PROGRESS,
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath('/employee/appraisal');

    return { success: true, data: updatedAppraisal };
  } catch (error) {
    console.error('Error submitting appraisal:', error);
    return { success: false, error: 'Failed to submit appraisal' };
  }
}

/**
 * Get appraisal statistics
 */
export async function getAppraisalStats() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const [total, draft, inProgress, completed] = await Promise.all([
      prisma.appraisalReview.count({
        where: { userId: session.user.id },
      }),
      prisma.appraisalReview.count({
        where: { 
          userId: session.user.id,
          status: AppraisalStatus.DRAFT,
        },
      }),
      prisma.appraisalReview.count({
        where: { 
          userId: session.user.id,
          status: AppraisalStatus.IN_PROGRESS,
        },
      }),
      prisma.appraisalReview.count({
        where: { 
          userId: session.user.id,
          status: AppraisalStatus.COMPLETED,
        },
      }),
    ]);

    // Get average rating from completed appraisals
    const completedAppraisals = await prisma.appraisalReview.findMany({
      where: {
        userId: session.user.id,
        status: AppraisalStatus.COMPLETED,
        finalRating: { not: null },
      },
      select: {
        finalRating: true,
      },
    });

    const avgRating = completedAppraisals.length > 0
      ? completedAppraisals.reduce((sum: number, a) => sum + (a.finalRating || 0), 0) / completedAppraisals.length
      : 0;

    return {
      success: true,
      data: {
        total,
        draft,
        inProgress,
        completed,
        avgRating: Math.round(avgRating * 10) / 10,
      },
    };
  } catch (error) {
    console.error('Error fetching appraisal stats:', error);
    return { success: false, error: 'Failed to fetch appraisal statistics' };
  }
}

/**
 * Get appraisal by ID
 */
export async function getAppraisalById(appraisalId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const appraisal = await prisma.appraisalReview.findFirst({
      where: {
        id: appraisalId,
        userId: session.user.id,
      },
      include: {
        cycle: true,
      },
    });

    if (!appraisal) {
      return { success: false, error: 'Appraisal not found or access denied' };
    }

    return { success: true, data: appraisal };
  } catch (error) {
    console.error('Error fetching appraisal:', error);
    return { success: false, error: 'Failed to fetch appraisal' };
  }
}
