import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { ModeToggle, ColorPicker, UserMenu } from "@/components/common";

export default async function LeadLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Tech Lead Dashboard
              </h1>
              <div className="flex items-center gap-3">
                <ModeToggle />
                <ColorPicker />
                <UserMenu />
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
            <nav className="flex space-x-8">
              <Link
                href="/lead"
                className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
              >
                Overview
              </Link>
              <Link
                href="/lead/team-board"
                className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
              >
                Team Board
              </Link>
              <Link
                href="/lead/sprints"
                className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
              >
                Sprints
              </Link>
              <Link
                href="/lead/metrics"
                className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
              >
                Technical Metrics
              </Link>
              <Link
                href="/lead/code-reviews"
                className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
              >
                Code Reviews
              </Link>
              <Link
                href="/lead/profile"
                className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
              >
                Profile
              </Link>
              <Link
                href="/lead/settings"
                className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
              >
                Settings
              </Link>
              <Link
                href="/lead/ai-features"
                className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
              >
                ✨ AI Features
              </Link>
            </nav>
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </SettingsProvider>
  );
}
