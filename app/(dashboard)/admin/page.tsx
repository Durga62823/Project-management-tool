import { redirect } from "next/navigation";
import { Users, Building2, FolderKanban, TrendingUp, Shield, Settings, Sparkles, ArrowUpRight, BarChart3, UserPlus } from "lucide-react";

import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-4">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">Admin Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              System Administration
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Manage organization, users, and platform settings
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Total Users</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">Active across organization</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Departments</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">With teams and members</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200/60 bg-white/70 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Active Projects</CardTitle>
              <div className="p-2 rounded-lg bg-green-100">
                <FolderKanban className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500 mt-1">On track and in progress</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-slate-200/60 bg-white/70 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Completion Rate</CardTitle>
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">0%</div>
              <p className="text-xs text-slate-500 mt-1">Organization average</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Management */}
            <Link href="/admin/users">
              <Card className="group relative overflow-hidden border-2 border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">User Management</h3>
                  <p className="text-sm text-slate-600 mb-4">Manage users, roles, and permissions</p>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                      <UserPlus className="h-3 w-3" />
                      Create User
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Organization */}
            <Link href="/admin/departments">
              <Card className="group relative overflow-hidden border-2 border-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-purple-600 shadow-lg shadow-purple-500/30">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Organization</h3>
                  <p className="text-sm text-slate-600 mb-4">Manage departments, teams, and structure</p>
                  <div className="flex gap-2">
                    <span className="text-xs font-medium text-purple-600">Departments</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-purple-600">Teams</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Projects */}
            <Link href="/admin/projects">
              <Card className="group relative overflow-hidden border-2 border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-green-600 shadow-lg shadow-green-500/30">
                      <FolderKanban className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-green-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Projects</h3>
                  <p className="text-sm text-slate-600">Overview of all projects and status</p>
                </CardContent>
              </Card>
            </Link>

            {/* Performance */}
            <Link href="/admin/analytics">
              <Card className="group relative overflow-hidden border-2 border-orange-200/50 bg-gradient-to-br from-orange-50 to-red-50 hover:border-orange-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-orange-600 shadow-lg shadow-orange-500/30">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-orange-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Performance</h3>
                  <p className="text-sm text-slate-600 mb-4">Analytics, KPIs, and appraisals</p>
                  <div className="flex gap-2">
                    <span className="text-xs font-medium text-orange-600">Analytics</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-orange-600">Appraisals</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Security & Audit */}
            <Link href="/admin/audit">
              <Card className="group relative overflow-hidden border-2 border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 hover:border-red-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-rose-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-red-600 shadow-lg shadow-red-500/30">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-red-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Security & Audit</h3>
                  <p className="text-sm text-slate-600">Audit logs and security settings</p>
                </CardContent>
              </Card>
            </Link>

            {/* Integrations & Settings */}
            <Link href="/admin/settings">
              <Card className="group relative overflow-hidden border-2 border-slate-200/50 bg-gradient-to-br from-slate-50 to-gray-50 hover:border-slate-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-400/20 to-gray-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-600 shadow-lg shadow-slate-500/30">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Integrations & Settings</h3>
                  <p className="text-sm text-slate-600 mb-4">Configure integrations and AI features</p>
                  <div className="flex gap-2">
                    <span className="text-xs font-medium text-slate-600">Integrations</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-600">Settings</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
