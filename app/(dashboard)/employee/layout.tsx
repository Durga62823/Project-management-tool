import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "@/components/common/LogoutButton";
import { UserMenu } from "@/components/common/UserMenu";
import { ModeToggle, ColorPicker } from "@/components/common";
import {
  Home,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";

export default async function EmployeeDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  // Allow EMPLOYEE and other roles to access dashboard
  const userRole = (session.user as any).role || "EMPLOYEE";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Project Management Tool
              </h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Employee
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <ColorPicker />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <Link
              href="/employee"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Home className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Dashboard</span>
            </Link>

            <Link
              href="/employee/my-work"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">My Tasks</span>
            </Link>

            <Link
              href="/employee/timesheet"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Timesheet</span>
            </Link>

            <Link
              href="/employee/performance"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Performance</span>
            </Link>

            <Link
              href="/employee/goals"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Target className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">My Goals</span>
            </Link>

            <Link
              href="/employee/calendar"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Calendar</span>
            </Link>

            <Link
              href="/employee/appraisal"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileText className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Appraisals</span>
            </Link>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">Settings</span>
              </Link>

              <div className="px-4 py-3">
                <LogoutButton />
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
