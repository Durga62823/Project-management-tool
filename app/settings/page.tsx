import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata = {
  title: "Settings | Make It Possible",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch user preferences and notifications from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      preferences: true,
      notificationSettings: true,
    },
  });

  const preferences = (user?.preferences as any) || {
    theme: "light",
    language: "English",
    timezone: "UTC",
  };

  const notifications = (user?.notificationSettings as any) || {
    emailNotifications: true,
    projectUpdates: true,
    teamActivity: true,
    loginAlerts: true,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Hero Header */}
      <div className="relative overflow-hidden bg-primary px-4 py-16 md:px-8">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary-foreground/20 backdrop-blur-sm rounded-2xl border border-primary-foreground/30 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Settings
              </h1>
              <p className="text-primary-foreground/80 text-lg">
                Manage your preferences, notifications, and account settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Preferences & Notifications (wider) - Glassmorphism */}
          <div className="lg:col-span-2">
            <div className="bg-card backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden">
              <SettingsClient
                initialPreferences={preferences}
                initialNotifications={notifications}
              />
            </div>
          </div>

          {/* Right Column - Account Settings - Glassmorphism */}
          <div className="bg-card backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden h-fit">
            <div className="bg-primary/10 px-6 py-5 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Account</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
            </div>

            <div className="p-6 space-y-3">
              <button className="group w-full px-4 py-3 text-sm font-medium text-foreground bg-primary/5 hover:bg-primary/10 border border-border hover:border-primary rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </button>
              <button className="group w-full px-4 py-3 text-sm font-medium text-foreground bg-primary/5 hover:bg-primary/10 border border-border hover:border-primary rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download My Data
              </button>
              <button className="group w-full px-4 py-3 text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 border border-destructive/30 hover:border-destructive rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
