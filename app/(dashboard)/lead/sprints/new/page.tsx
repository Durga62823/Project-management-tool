"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { createSprint } from "@/app/actions/lead-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Sparkles, ArrowLeft, Calendar } from "lucide-react";

const sprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required"),
  goal: z.string().min(1, "Sprint goal is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  capacityHours: z.coerce.number().min(1, "Capacity must be at least 1 hour"),
});

type SprintFormData = z.infer<typeof sprintSchema>;

export default function NewSprintPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SprintFormData>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      capacityHours: 320, // Default 2-week sprint with 4 people at 40h/week
    },
  });

  const onSubmit = (data: SprintFormData) => {
    startTransition(async () => {
      const result = await createSprint({
        name: data.name,
        goal: data.goal,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        capacityHours: data.capacityHours,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Sprint created successfully");
      router.push("/lead/sprints");
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/lead/sprints"
              className="flex items-center gap-2 text-primary hover:text-primary font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sprints
            </Link>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-primary-foreground rounded-full shadow-lg w-fit mb-3">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">New Sprint</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Create New Sprint
          </h1>
          <p className="text-primary mt-2">Set up a new sprint for your team</p>
        </div>

        <div className="border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Sprint Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Sprint Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Sprint 15 - Q1 2025"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-primary">{errors.name.message}</p>
            )}
          </div>

          {/* Sprint Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal">Sprint Goal *</Label>
            <textarea
              id="goal"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Complete user authentication and dashboard redesign"
              {...register("goal")}
            />
            {errors.goal && (
              <p className="text-sm text-primary">{errors.goal.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-primary">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="text-sm text-primary">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacityHours">Team Capacity (hours) *</Label>
            <Input
              id="capacityHours"
              type="number"
              min="1"
              placeholder="320"
              {...register("capacityHours")}
            />
            {errors.capacityHours && (
              <p className="text-sm text-primary">{errors.capacityHours.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Estimate total available hours for the sprint (e.g., 4 people × 40h/week × 2 weeks = 320h)
            </p>
          </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                {isPending ? "Creating..." : "Create Sprint"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/lead/sprints")}
                disabled={isPending}
                className="border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 border-border bg-card backdrop-blur-sm shadow-lg rounded-xl p-5 border-2 border-primary/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Sprint Planning Tips
            </h3>
          </div>
          <ul className="text-sm text-primary space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Keep sprints between 1-4 weeks (2 weeks is most common)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Set a clear, achievable goal that the team can rally around</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Account for holidays, meetings, and buffer time in capacity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Review velocity from past sprints to guide planning</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
