import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getTeamTasks,
  getTeamSprints,
  getBlockedTasks,
  getTeamWorkload,
  getSprintVelocity,
} from "@/lib/lead-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Users,
  ListChecks,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Target,
  Plus,
  Calendar as CalendarIcon,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

export default async function LeadOverviewPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          _count: {
            select: { users: true },
          },
        },
      },
    },
  });

  if (!user?.team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-border bg-card backdrop-blur-sm shadow-xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="p-4 rounded-full bg-primary/10 inline-flex mb-6">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">No Team Assigned</h2>
            <p className="text-muted-foreground">Please contact your administrator to assign you to a team.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teamId = user.team.id;

  const [
    allTasks,
    activeSprints,
    blockedTasks,
    workload,
    velocityData,
  ] = await Promise.all([
    getTeamTasks(teamId),
    getTeamSprints(teamId, false),
    getBlockedTasks(teamId),
    getTeamWorkload(teamId),
    getSprintVelocity(teamId, 5),
  ]);

  const tasksByStatus = {
    todo: allTasks.filter((t) => t.status === "TODO").length,
    inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
    inReview: allTasks.filter((t) => t.status === "IN_REVIEW").length,
    done: allTasks.filter((t) => t.status === "DONE").length,
    blocked: blockedTasks.length,
  };

  const currentSprint = activeSprints.find((s) => s.status === "ACTIVE");

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
              <span className="text-sm font-medium text-primary-foreground">Tech Lead Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              {user.team.name}
            </h1>
            <p className="text-lg text-primary-foreground/80">
              {user.team._count.users} team members • {allTasks.length} total tasks
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="relative pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ListChecks className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">To Do</p>
              <p className="text-3xl font-bold text-foreground">{tasksByStatus.todo}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="relative pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">In Progress</p>
              <p className="text-3xl font-bold text-primary">{tasksByStatus.inProgress}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="relative pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ListChecks className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">In Review</p>
              <p className="text-3xl font-bold text-primary">{tasksByStatus.inReview}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="relative pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Done</p>
              <p className="text-3xl font-bold text-primary">{tasksByStatus.done}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border bg-card backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="relative pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Blocked</p>
              <p className="text-3xl font-bold text-destructive">{tasksByStatus.blocked}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Sprint */}
          <Card className="border-border bg-card backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary">
                  <Target className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Current Sprint</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {currentSprint ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-foreground text-lg">{currentSprint.name}</h4>
                      {currentSprint.goal && (
                        <p className="text-sm text-muted-foreground mt-1">{currentSprint.goal}</p>
                      )}
                    </div>
                    <Link
                      href="/lead/sprints"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Details
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="space-y-3 p-4 rounded-xl bg-primary/10">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span className="font-bold text-foreground">{currentSprint.progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-primary h-3 rounded-full transition-all duration-500"
                          style={{ width: `${currentSprint.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-card">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Tasks</p>
                        <p className="text-2xl font-bold text-foreground">
                          {currentSprint.completedTasks}<span className="text-base text-muted-foreground">/{currentSprint.totalTasks}</span>
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-card">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Points</p>
                        <p className="text-2xl font-bold text-foreground">
                          {currentSprint.completedPoints}<span className="text-base text-muted-foreground">/{currentSprint.totalPoints}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Ends: {new Date(currentSprint.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-primary/10 inline-flex mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-6">No active sprint</p>
                  <Link
                    href="/lead/sprints"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <Plus className="h-5 w-5" />
                    Plan Sprint
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sprint Velocity */}
          <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Sprint Velocity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {velocityData.velocities.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
                    <p className="text-sm text-slate-600 font-medium mb-2">Average Velocity</p>
                    <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {velocityData.avgVelocity.toFixed(1)}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">points per sprint</p>
                  </div>
                  <div className="space-y-3">
                    {velocityData.velocities.slice(0, 3).map((v, idx) => (
                      <div key={v.sprintId} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium text-slate-700">{v.sprintName}</span>
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">{v.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-slate-100 inline-flex mb-4">
                    <TrendingUp className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">No completed sprints yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Blocked Tasks */}
        {blockedTasks.length > 0 && (
          <Card className="border-red-200/60 bg-red-50/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-600">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">Blocked Tasks</CardTitle>
                </div>
                <Link
                  href="/lead/team-board?filter=blocked"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockedTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-white rounded-xl border-2 border-red-200 hover:shadow-md transition-all"
                  >
                    <h4 className="font-bold text-slate-900 mb-1">{task.title}</h4>
                    {task.blockedReason && (
                      <p className="text-sm text-red-600 mb-2">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        {task.blockedReason}
                      </p>
                    )}
                    {task.project && (
                      <p className="text-xs text-slate-500">{task.project.name}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Workload */}
        <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Team Workload</CardTitle>
              </div>
              <Link
                href="/lead/team-board"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Manage
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workload.slice(0, 5).map((member) => (
                <div key={member.userId} className="p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-900">{member.userName}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">{member.taskCount} tasks</span>
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">{member.storyPoints} pts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (member.storyPoints / Math.max(...workload.map((w) => w.storyPoints))) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    {member.blocked > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-bold whitespace-nowrap">
                        <AlertTriangle className="h-3 w-3" />
                        {member.blocked} blocked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/lead/team-board?action=create-task">
              <Card className="group relative overflow-hidden border-2 border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Create Task</h3>
                  <p className="text-sm text-slate-600">Add a new task to the board</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/lead/sprints?action=create-sprint">
              <Card className="group relative overflow-hidden border-2 border-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-purple-600 shadow-lg shadow-purple-500/30">
                      <CalendarIcon className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Plan Sprint</h3>
                  <p className="text-sm text-slate-600">Create and plan a new sprint</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/lead/metrics">
              <Card className="group relative overflow-hidden border-2 border-green-200/50 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-green-600 shadow-lg shadow-green-500/30">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-green-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">View Metrics</h3>
                  <p className="text-sm text-slate-600">Track team technical metrics</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
