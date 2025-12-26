import { requireLead } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { getTeamCodeReviews } from "@/lib/lead-helpers";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default async function LeadCodeReviewsPage() {
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

  const codeReviews = await getTeamCodeReviews(user.team.id);

  const pendingReviews = codeReviews.filter((r) => r.status === "pending");
  const inProgressReviews = codeReviews.filter((r) => r.status === "changes_requested");
  const approvedReviews = codeReviews.filter((r) => r.status === "approved").slice(0, 10);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-primary/10 text-yellow-800";
      case "approved":
        return "bg-primary/10 text-green-800";
      case "changes_requested":
        return "bg-primary/10 text-orange-800";
      default:
        return "bg-primary/10 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "approved":
        return "Approved";
      case "changes_requested":
        return "Changes Requested";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background space-y-6">
      <div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-primary-foreground rounded-full shadow-lg w-fit mb-3">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold">Code Quality</span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Code Reviews
        </h1>
        <p className="text-primary mt-2">Review and approve pull requests from your team</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Pending Review</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                {pendingReviews.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Changes Requested</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                {inProgressReviews.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Approved</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                {approvedReviews.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Pending Your Review ({pendingReviews.length})
            </h2>
            <div className="space-y-3">
              {pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-primary/20 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(review.status)}`}
                        >
                          {getStatusLabel(review.status)}
                        </span>
                        <h3 className="font-semibold text-gray-900">{review.prTitle}</h3>
                      </div>
                      <p className="text-sm text-primary mb-3">
                        by {review.author?.name || "Unknown"} •{" "}
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-primary">
                        <span>{review.filesChanged} files changed</span>
                        <span>{review.linesChanged} lines</span>
                        {review.comments > 0 && <span>{review.comments} comments</span>}
                      </div>
                    </div>
                    <a
                      href={review.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-primary-foreground rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm font-medium"
                    >
                      Review PR →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Changes Requested */}
      {inProgressReviews.length > 0 && (
        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Changes Requested ({inProgressReviews.length})
            </h2>
            <div className="space-y-3">
              {inProgressReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-primary/20 bg-gradient-to-br from-orange-50 to-rose-50 rounded-lg p-4 hover:border-orange-400 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(review.status)}`}
                        >
                          {getStatusLabel(review.status)}
                        </span>
                        <h3 className="font-semibold text-gray-900">{review.prTitle}</h3>
                      </div>
                      <p className="text-sm text-primary mb-3">
                        by {review.author?.name || "Unknown"} • Reviewed{" "}
                        {review.reviewedAt
                          ? formatDistanceToNow(new Date(review.reviewedAt), { addSuffix: true })
                          : "recently"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-primary">
                        <span>{review.filesChanged} files</span>
                        <span>{review.linesChanged} lines</span>
                        <span>{review.comments} comments</span>
                      </div>
                    </div>
                    <a
                      href={review.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-4 py-2 bg-gradient-to-r from-orange-600 to-rose-600 text-primary-foreground rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm font-medium"
                    >
                      View PR →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recently Approved */}
      {approvedReviews.length > 0 && (
        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Recently Approved
            </h2>
            <div className="space-y-3">
              {approvedReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-primary/20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(review.status)}`}
                        >
                          {getStatusLabel(review.status)}
                        </span>
                        <h3 className="font-semibold text-gray-900">{review.prTitle}</h3>
                      </div>
                      <p className="text-sm text-primary mb-3">
                        by {review.author?.name || "Unknown"} • Approved{" "}
                        {review.reviewedAt
                          ? formatDistanceToNow(new Date(review.reviewedAt), { addSuffix: true })
                          : "recently"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-primary">
                        <span>{review.filesChanged} files</span>
                        <span>{review.linesChanged} lines</span>
                        {review.comments > 0 && <span>{review.comments} comments</span>}
                      </div>
                    </div>
                    <a
                      href={review.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-primary hover:text-primary font-medium text-sm hover:scale-105 transition-transform"
                    >
                      View PR →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {codeReviews.length === 0 && (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              No Code Reviews Yet
            </h2>
            <p className="text-primary">
              Pull requests from your team will appear here for review.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
