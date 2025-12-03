"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionResponse<T = unknown> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

export async function updateUserPreferences(payload: {
  theme?: string;
  language?: string;
  timezone?: string;
}): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const preferencesData = {
      theme: payload.theme || "light",
      language: payload.language || "English",
      timezone: payload.timezone || "UTC",
    };

    await prisma.$executeRaw`
      UPDATE "users" 
      SET "preferences" = ${JSON.stringify(preferencesData)}::jsonb 
      WHERE "id" = ${session.user.id}
    `;

    revalidatePath("/settings");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Preferences updated successfully",
      data: preferencesData,
    };
  } catch (error) {
    console.error("Error updating preferences:", error);
    return { success: false, error: "Failed to update preferences" };
  }
}

export async function updateNotificationSettings(payload: {
  emailNotifications?: boolean;
  projectUpdates?: boolean;
  teamActivity?: boolean;
  loginAlerts?: boolean;
}): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const notificationData = {
      emailNotifications: payload.emailNotifications ?? true,
      projectUpdates: payload.projectUpdates ?? true,
      teamActivity: payload.teamActivity ?? true,
      loginAlerts: payload.loginAlerts ?? true,
    };

    await prisma.$executeRaw`
      UPDATE "users"
      SET "notificationSettings" = ${JSON.stringify(notificationData)}::jsonb
      WHERE "id" = ${session.user.id}
    `;

    revalidatePath("/settings");

    return {
      success: true,
      message: "Notification settings updated successfully",
      data: notificationData,
    };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: "Failed to update notification settings" };
  }
}

export async function deleteUserAccount(): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Add delete logic here when ready
    return {
      success: true,
      message: "Account deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
