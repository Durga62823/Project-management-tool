import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getDirectReports,
  getTeamCapacity,
  getPendingPTORequests,
  getPendingTimesheets,
} from "@/lib/manager-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Users,
  Clock,
  FileText,
  Activity,
  Sparkles,
  ArrowUpRight,
  CalendarClock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "Manager Dashboard | Make It Possible",
};

export default async function ManagerPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  const [directReports, pendingPTO, pendingTimesheets, teamCapacity] = await Promise.all([
    getDirectReports(session.user.id),
    getPendingPTORequests(session.user.id),
    getPendingTimesheets(session.user.id),
    getTeamCapacity(session.user.id),
  ]);

  const avgUtilization = teamCapacity.length > 0
    ? teamCapacity.reduce((sum, m) => sum + m.utilization, 0) / teamCapacity.length
    : 0;

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
              <span className="text-sm font-medium text-primary-foreground">Manager Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              Welcome, {session.user.name || "Manager"}
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Here's what's happening with your team
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Team Members</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{directReports.length}</div>
              <Link
                href="/manager/team"
                className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
              >
                View team
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Pending PTO</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarClock className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{pendingPTO.length}</div>
              <Link
                href="/manager/pto"
                className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
              >
                Review requests
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Pending Timesheets</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{pendingTimesheets.length}</div>
              <Link
                href="/manager/timesheets"
                className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
              >
                Review timesheets
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Team Utilization</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {(avgUtilization * 100).toFixed(0)}%
              </div>
              <Link
                href="/manager/capacity"
                className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
              >
                View capacity
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent PTO Requests */}
          <Card className="border-border bg-card backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Recent PTO Requests</CardTitle>
                  <CardDescription className="mt-1">Pending time-off approvals</CardDescription>
                </div>
                <Link
                  href="/manager/pto"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                >
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingPTO.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        {request.user.firstName} {request.user.lastName}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{request.type.replace("_", " ")}</span>
                        <span>•</span>
                        <span>{request.days} days</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {new Date(request.startDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {pendingPTO.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-primary/10 mb-3">
                      <CalendarClock className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">No pending PTO requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Timesheets */}
          <Card className="border-border bg-card backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Pending Timesheets</CardTitle>
                  <CardDescription className="mt-1">Awaiting your review</CardDescription>
                </div>
                <Link
                  href="/manager/timesheets"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                >
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTimesheets.slice(0, 5).map((timesheet) => (
                  <div
                    key={timesheet.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        {timesheet.user.firstName} {timesheet.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Week of {new Date(timesheet.weekStart).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {timesheet.totalHours}h
                    </div>
                  </div>
                ))}
                {pendingTimesheets.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-primary/10 mb-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">No pending timesheets</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Capacity Overview */}
        <Card className="border-border bg-card backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">Team Capacity</CardTitle>
            <CardDescription>Current workload and utilization metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamCapacity.map((member) => (
                <div 
                  key={member.user.id} 
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      {member.user.firstName} {member.user.lastName}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{member.activeProjects} active projects</span>
                      <span>•</span>
                      <span>{member.avgWeeklyHours.toFixed(1)}h/week avg</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${
                          member.utilization > 1
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : member.utilization > 0.8
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-500"
                        }`}
                        style={{ width: `${Math.min(member.utilization * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 min-w-[60px]">
                      <span className="text-sm font-bold text-foreground">
                        {(member.utilization * 100).toFixed(0)}%
                      </span>
                      {member.utilization > 1 && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {teamCapacity.length === 0 && (
                <div className="py-12 text-center">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">No team members assigned</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
