import { requireManager } from "@/lib/guards";
import { getDirectReports, getExtendedTeam } from "@/lib/manager-helpers";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Team | Manager Dashboard",
};

export default async function ManagerTeamPage() {
  const session = await requireManager();
  const { directReports, extendedReports } = await getExtendedTeam(session.user.id);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Manager - Team
            </h1>
            <p className="mt-1 text-muted-foreground">
              Your direct reports and extended team members
            </p>
          </div>
        </div>

        {/* Direct Reports */}
        <div className="rounded-2xl border border-border bg-card backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="border-b border-border bg-primary/10 px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">
              Direct Reports ({directReports.length})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {directReports.map((member) => (
              <div key={member.id} className="px-6 py-4 transition-all hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                      <div>
                        <Link
                          href={`/manager/team/${member.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors">
                        
                          {member.firstName} {member.lastName}
                        </Link>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Position:</span>{" "}
                        <span className="font-medium text-foreground">
                          {member.position || "Not set"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department:</span>{" "}
                        <span className="font-medium text-foreground">
                          {member.department?.name || "Not assigned"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Team:</span>{" "}
                        <span className="font-medium text-foreground">
                          {member.team?.name || "Not assigned"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Active Projects:</span>{" "}
                        <span className="font-medium text-foreground">
                          {member.projectMembers.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/manager/team/${member.id}`}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-all"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/manager/one-on-ones?userId=${member.id}`}
                      className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
                    
                      Schedule 1:1
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {directReports.length === 0 && (
              <div className="px-6 py-12 text-center text-muted-foreground">
                No direct reports assigned
              </div>
            )}
          </div>
        </div>

        {/* Extended Team */}
        {extendedReports.length > 0 && (
          <div className="rounded-2xl border border-border bg-card backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="border-b border-border bg-primary/10 px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">
                Extended Team ({extendedReports.length})
              </h3>
              <p className="text-sm text-muted-foreground">
                Reports of your direct reports
              </p>
            </div>
            <div className="divide-y divide-border">
              {extendedReports.map((member) => (
                <div key={member.id} className="px-6 py-4 transition-all hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Reports to {member.manager?.firstName} {member.manager?.lastName}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Position:</span>{" "}
                        <span className="font-medium text-foreground">
                          {member.position || "Not set"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Team:</span>{" "}
                        <span className="font-medium text-foreground">
                          {member.team?.name || "Not assigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
