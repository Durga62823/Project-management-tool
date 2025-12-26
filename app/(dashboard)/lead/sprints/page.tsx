import { requireLead } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getTeamSprints, getSprintBurndown } from "@/lib/lead-helpers";
import { format } from "date-fns";
import Link from "next/link";
import { Sparkles, Plus } from "lucide-react";

export default async function LeadSprintsPage() {
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

  const sprints = await getTeamSprints(user.team.id, true);
  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const planningSprint = sprints.find((s) => s.status === "PLANNING");
  const completedSprints = sprints.filter((s) => s.status === "COMPLETED").slice(0, 5);

  let burndownData = null;
  if (activeSprint) {
    burndownData = await getSprintBurndown(activeSprint.id);
  }

  return (
    <div className="min-h-screen bg-background space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-primary-foreground rounded-full shadow-lg w-fit mb-3">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Sprint Management</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Sprint Planning
          </h1>
          <p className="text-primary mt-2">Manage sprints and track team velocity</p>
        </div>
        <Link
          href="/lead/sprints/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-primary-foreground rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Sprint
        </Link>
      </div>

      {/* Active Sprint */}
      {activeSprint && (
        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl border-2 border-primary/20 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-primary-foreground text-xs font-semibold rounded-full shadow-md">
                    ACTIVE
                  </span>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {activeSprint.name}
                  </h2>
                </div>
                <p className="text-primary">{activeSprint.goal}</p>
              </div>
              <Link
                href={`/lead/sprints/${activeSprint.id}`}
                className="text-primary hover:text-primary font-medium hover:scale-105 transition-transform"
              >
                View Details →
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
                <p className="text-sm text-primary mb-1">Duration</p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(activeSprint.startDate), "MMM d")} -{" "}
                  {format(new Date(activeSprint.endDate), "MMM d")}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
                <p className="text-sm text-primary mb-1">Story Points</p>
                <p className="text-lg font-semibold text-gray-900">
                  {activeSprint._count?.tasks || 0} tasks
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
                <p className="text-sm text-primary mb-1">Capacity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {activeSprint.capacityHours}h
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
                <p className="text-sm text-primary mb-1">Velocity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {activeSprint.velocity || "-"} pts
                </p>
              </div>
            </div>

            {/* Burndown Chart Placeholder */}
            {burndownData && burndownData.ideal && burndownData.actual && (
              <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-border">
                <h3 className="text-sm font-semibold text-primary mb-3">Sprint Burndown</h3>
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-purple-300 rounded-lg bg-white/50">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Ideal: {burndownData.ideal.join(", ")}</p>
                    <p className="text-sm mt-1">Actual: {burndownData.actual.join(", ")}</p>
                    <p className="text-xs mt-2 text-gray-400">Chart visualization to be implemented</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Planning Sprint */}
      {planningSprint && (
        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-primary-foreground text-xs font-semibold rounded-full shadow-md">
                    PLANNING
                  </span>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {planningSprint.name}
                  </h2>
                </div>
                <p className="text-primary">{planningSprint.goal}</p>
              </div>
              <Link
                href={`/lead/sprints/${planningSprint.id}`}
                className="text-primary hover:text-primary font-medium hover:scale-105 transition-transform"
              >
                Plan Sprint →
              </Link>
            </div>

            <div className="flex gap-4 mt-4">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 flex-1 border border-border hover:shadow-md transition-shadow">
                <p className="text-sm text-primary mb-1">Start Date</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(planningSprint.startDate), "MMM d, yyyy")}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 flex-1 border border-border hover:shadow-md transition-shadow">
                <p className="text-sm text-primary mb-1">End Date</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(planningSprint.endDate), "MMM d, yyyy")}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 flex-1 border border-border hover:shadow-md transition-shadow">
                <p className="text-sm text-primary mb-1">Capacity</p>
                <p className="font-semibold text-gray-900">{planningSprint.capacityHours}h</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completed Sprints */}
      {completedSprints.length > 0 && (
        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Recent Sprints
            </h2>
            <div className="space-y-3">
              {completedSprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-border hover:shadow-md hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-gradient-to-r from-gray-500 to-slate-500 text-primary-foreground text-xs font-semibold rounded-full shadow-md">
                        COMPLETED
                      </span>
                      <h3 className="font-semibold text-gray-900">{sprint.name}</h3>
                    </div>
                    <p className="text-sm text-primary">{sprint.goal}</p>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Velocity</p>
                      <p className="text-lg font-bold text-primary">{sprint.velocity || "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Tasks</p>
                      <p className="text-lg font-bold text-primary">{sprint._count?.tasks || 0}</p>
                    </div>
                    <Link
                      href={`/lead/sprints/${sprint.id}`}
                      className="text-primary hover:text-primary font-medium text-sm hover:scale-105 transition-transform"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!activeSprint && !planningSprint && completedSprints.length === 0 && (
        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-12 text-center hover:shadow-xl transition-all duration-300">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              No Sprints Yet
            </h2>
            <p className="text-primary mb-6">
              Create your first sprint to start planning and tracking team work.
            </p>
            <Link
              href="/lead/sprints/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-primary-foreground rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
            >
              <Plus className="h-4 w-4" />
              Create First Sprint
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
