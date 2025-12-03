import { redirect } from "next/navigation";
import { Users, Building2, FolderKanban, TrendingUp, Shield, Settings } from "lucide-react";

import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();                                 

  if (!session?.user) {
    redirect("/auth/login");
  }

  // TODO: Check if user has admin role once migrations are run
  // if (session.user.role !== "ADMIN") {
  //   redirect("/dashboard");
  // }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active across organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">With teams and members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">On track and in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Organization average</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage users, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/users">
              <Button className="w-full" variant="outline">
                View All Users
              </Button>
            </Link>
            <Link href="/admin/users/create">
              <Button className="w-full">Create New User</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization
            </CardTitle>
            <CardDescription>
              Manage departments, teams, and structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/departments">
              <Button className="w-full" variant="outline">
                Departments
              </Button>
            </Link>
            <Link href="/admin/teams">
              <Button className="w-full" variant="outline">
                Teams
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Projects
            </CardTitle>
            <CardDescription>
              Overview of all projects and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/projects">
              <Button className="w-full" variant="outline">
                View All Projects
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>
              Analytics, KPIs, and appraisals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/analytics">
              <Button className="w-full" variant="outline">
                View Analytics
              </Button>
            </Link>
            <Link href="/admin/appraisals">
              <Button className="w-full" variant="outline">
                Appraisals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Audit
            </CardTitle>
            <CardDescription>
              Audit logs and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/audit">
              <Button className="w-full" variant="outline">
                View Audit Logs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Integrations & Settings
            </CardTitle>
            <CardDescription>
              Configure integrations and AI features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/integrations">
              <Button className="w-full" variant="outline">
                Integrations
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button className="w-full" variant="outline">
                Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
