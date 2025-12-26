import { requireLead } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getTeamTechnicalMetrics, getTaskMetrics } from "@/lib/lead-helpers";
import { subDays } from "date-fns";
import { Sparkles } from "lucide-react";

export default async function LeadMetricsPage() {
  const session = await requireLead();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      team: {
        select: { id: true, name: true },
      },
    },
  });

  if (!user?.team) {
    return (
      <div className="min-h-screen bg-background">
        <div className="text-center py-12">
          <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Team Assigned</h2>
            <p className="text-primary">Please contact your administrator to assign you to a team.</p>
          </div>
        </div>
      </div>
    );
  }

  const weekAgo = subDays(new Date(), 7);
  const monthAgo = subDays(new Date(), 30);

  const [weeklyMetrics, monthlyMetrics, taskMetrics] = await Promise.all([
    getTeamTechnicalMetrics(user.team.id, weekAgo, new Date()),
    getTeamTechnicalMetrics(user.team.id, monthAgo, new Date()),
    getTaskMetrics(user.team.id),
  ]);

  const getMetricValue = (metrics: any[] | any, type: string) => {
    if (!metrics || !Array.isArray(metrics)) return "-";
    const metric = metrics.find((m) => m.metricType === type);
    return metric ? `${metric.value}${metric.unit === "hours" ? "h" : metric.unit === "minutes" ? "m" : ""}` : "-";
  };

  const getMetricNumber = (metrics: any[] | any, type: string) => {
    if (!metrics || !Array.isArray(metrics)) return 0;
    const metric = metrics.find((m) => m.metricType === type);
    return metric?.value || 0;
  };

  return (
    <div className="min-h-screen bg-background space-y-6">
      <div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-primary-foreground rounded-full shadow-lg w-fit mb-3">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold">Team Metrics</span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Technical Metrics
        </h1>
        <p className="text-primary mt-2">Monitor code quality and team performance</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-primary">PR Merge Time</p>
            <span className="text-xs text-primary font-medium">Weekly Avg</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {getMetricValue(weeklyMetrics, "pr_merge_time")}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Target: &lt;24h
          </p>
        </div>

        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-primary">Code Review Time</p>
            <span className="text-xs text-primary font-medium">Weekly Avg</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {getMetricValue(weeklyMetrics, "code_review_time")}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Target: &lt;4h
          </p>
        </div>

        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-primary">Build Time</p>
            <span className="text-xs text-primary font-medium">Latest</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {getMetricValue(weeklyMetrics, "build_time")}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Target: &lt;5m
          </p>
        </div>

        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-primary">Deployment Freq</p>
            <span className="text-xs text-primary font-medium">This Week</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {getMetricNumber(weeklyMetrics, "deployment_frequency")}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            deploys/week
          </p>
        </div>
      </div>

      {/* Task Cycle Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <p className="text-sm font-medium text-primary mb-2">Average Cycle Time</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {taskMetrics.averageCycleTime ? `${taskMetrics.averageCycleTime.toFixed(1)}d` : "-"}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Time from start to completion
          </p>
        </div>

        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <p className="text-sm font-medium text-primary mb-2">Average Lead Time</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {taskMetrics.averageLeadTime ? `${taskMetrics.averageLeadTime.toFixed(1)}d` : "-"}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Time from creation to completion
          </p>
        </div>

        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <p className="text-sm font-medium text-primary mb-2">Tasks Completed</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {taskMetrics.completedTasks || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This sprint
          </p>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Quality Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-primary">Bug Count</p>
                <span className="text-xs text-primary font-medium">This Sprint</span>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {getMetricNumber(weeklyMetrics, "bug_count")}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Target: &lt;10 per sprint
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-primary">Test Coverage</p>
                <span className="text-xs text-primary font-medium">Current</span>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {getMetricNumber(weeklyMetrics, "test_coverage")}%
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Target: &gt;80%
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-primary">API Response Time</p>
                <span className="text-xs text-primary font-medium">Avg P95</span>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {getMetricValue(weeklyMetrics, "api_response_time")}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Target: &lt;200ms
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis Placeholder */}
      <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            30-Day Trend
          </h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-purple-300 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-sm font-medium">Trend Chart Visualization</p>
              <p className="text-xs mt-1">Chart library integration coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Monthly Summary
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-border hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-primary">Total PRs Merged</span>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {getMetricNumber(monthlyMetrics, "pr_merged_count") || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-border hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-primary">Total Deployments</span>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {getMetricNumber(monthlyMetrics, "deployment_frequency") || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-border hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-primary">Total Bugs Fixed</span>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {getMetricNumber(monthlyMetrics, "bugs_fixed") || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
