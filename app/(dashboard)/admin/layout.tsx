import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Building2,
  FolderKanban,
  TrendingUp,
  Shield,
  Settings,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { UserMenu, LogoutButton, ModeToggle, ColorPicker } from "@/components/common";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Departments", href: "/admin/departments", icon: Building2 },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { name: "AI Features", href: "/admin/ai-features", icon: Sparkles },
  { name: "Audit Logs", href: "/admin/audit", icon: Shield },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-64 overflow-y-auto border-r bg-white lg:flex lg:flex-col">
        <div className="flex h-full flex-col">
          <div className="px-4 py-6 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Organization management
            </p>
            <div className="flex items-center gap-2 mt-3">
              <ModeToggle />
              <ColorPicker />
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {adminNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="border-b bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <h1 className="text-xl font-bold text-gray-900">Admin</h1>
              </div>
              <div className="hidden lg:block">
                <h2 className="text-sm font-medium text-gray-600">Dashboard</h2>
              </div>
            </div>

            {/* User Menu - Visible on all screens */}
            <div className="flex items-center gap-2">
              <UserMenu
                name={session.user?.name}
                email={session.user?.email}
                image={session.user?.image}
              />
              <LogoutButton
                variant="ghost"
                size="sm"
                showIcon={true}
                showLabel={false}
                className="hidden lg:flex"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
