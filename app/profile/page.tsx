import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserProfile } from "@/components/common";

export const metadata = {
  title: "Profile | Make It Possible",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Hero Header */}
      <div className="relative overflow-hidden bg-primary px-4 py-16 md:px-8">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-primary-foreground/20 backdrop-blur-sm border-4 border-primary-foreground/30 flex items-center justify-center text-primary-foreground text-3xl md:text-4xl font-bold overflow-hidden shadow-2xl">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 border-4 border-background shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                {user.name || "User"}
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-3">{user.email}</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground border border-primary-foreground/30">
                  {user.role || "User"}
                </span>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary/20 backdrop-blur-sm text-primary-foreground border border-primary/30">
                  ✓ Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Profile Information Card - Glassmorphism */}
          <div className="lg:col-span-2">
            <div className="bg-card backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-primary/10 px-6 py-5 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
                <p className="text-sm text-muted-foreground mt-1">Your account details and settings</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-xl border border-border">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium text-foreground">
                        {user.name || "Not set"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-xl border border-border">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Account Status
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-xl border border-border">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-primary">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      User Role
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 rounded-xl border border-border">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-foreground capitalize">
                        {user.role || "User"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card - Glassmorphism */}
          <div className="bg-card backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden h-fit">
            <div className="bg-primary/10 px-6 py-5 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="group w-full px-4 py-3 text-sm font-medium text-foreground bg-primary/5 hover:bg-primary/10 rounded-xl border border-border hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
              <button className="group w-full px-4 py-3 text-sm font-medium text-foreground bg-primary/5 hover:bg-primary/10 rounded-xl border border-border hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </button>
              <button className="group w-full px-4 py-3 text-sm font-medium text-foreground bg-primary/5 hover:bg-primary/10 rounded-xl border border-border hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Two-Factor Auth
              </button>
            </div>
          </div>
        </div>

        {/* Security & Privacy Section - Glassmorphism */}
        <div className="bg-card backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-primary/10 px-6 py-5 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Security & Privacy</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your security preferences and privacy settings
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="group flex items-center justify-between p-5 bg-primary/5 hover:bg-primary/10 border border-border rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive email updates about your account
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>
            <div className="group flex items-center justify-between p-5 bg-primary/5 hover:bg-primary/10 border border-border rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Login Alerts
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified of unusual login activity
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
