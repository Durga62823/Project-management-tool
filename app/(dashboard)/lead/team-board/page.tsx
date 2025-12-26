import { requireLead } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getTeamTasks, getTeamMembers } from "@/lib/lead-helpers";
import { TaskBoard } from "@/components/lead/TaskBoard";
import { Sparkles } from "lucide-react";

export default async function TeamBoardPage() {
  const session = await requireLead();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
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

  const [tasks, teamMembers] = await Promise.all([
    getTeamTasks(user.team.id),
    getTeamMembers(session.user.id),
  ]);

  // Get active sprints for filtering
  const sprints = await prisma.sprint.findMany({
    where: {
      teamId: user.team.id,
      status: { in: ["PLANNING", "ACTIVE"] },
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
    orderBy: { startDate: "desc" },
  });

  // Get team projects for filtering
  const projects = await prisma.project.findMany({
    where: { teamId: user.team.id },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-primary-foreground rounded-full shadow-lg">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Tech Lead</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {user.team.name} - Task Board
        </h2>
        <p className="text-primary mt-2">Manage and coordinate team tasks with intelligent tracking</p>
      </div>

      <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
        <TaskBoard
          tasks={tasks}
          teamMembers={teamMembers}
          sprints={sprints}
          projects={projects}
        />
      </div>
    </div>
  );
}
