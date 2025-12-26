"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, CheckCircle, Sparkles } from "lucide-react";
import { TeamPerformanceAnalytics } from "@/components/manager/TeamPerformanceAnalytics";
import { ResourceOptimization } from "@/components/manager/ResourceOptimization";
import { ApprovalAssistant } from "@/components/manager/ApprovalAssistant";
import { ReportGeneration } from "@/components/shared/ReportGeneration";

type AIFeature =
  | "team-performance"
  | "resource-optimization"
  | "approval-assistant"
  | "report-generation"
  | null;

export default function ManagerAIFeaturesPage() {
  const [activeFeature, setActiveFeature] = useState<AIFeature>(null);

  const features = [
    {
      id: "team-performance" as const,
      title: "Team Performance Analytics",
      description:
        "Analyze team productivity, identify trends, and detect burnout risks",
      icon: Users,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      id: "resource-optimization" as const,
      title: "Resource Optimization",
      description:
        "Optimize team allocation, identify conflicts, and predict hiring needs",
      icon: TrendingUp,
      color: "green",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      id: "approval-assistant" as const,
      title: "Approval Assistant",
      description: "Get AI recommendations for timesheet and PTO approvals",
      icon: CheckCircle,
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      id: "report-generation" as const,
      title: "Smart Report Generator",
      description: "Generate comprehensive project reports with insights",
      icon: Sparkles,
      color: "orange",
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-50 to-amber-50",
    },
  ];

  const renderFeature = () => {
    switch (activeFeature) {
      case "team-performance":
        return <TeamPerformanceAnalytics />;
      case "resource-optimization":
        return <ResourceOptimization />;
      case "approval-assistant":
        return <ApprovalAssistant />;
      case "report-generation":
        return <ReportGeneration />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Manager - AI Features
            </h1>
            <p className="mt-1 text-muted-foreground">
              AI-powered tools to enhance team management and decision-making
            </p>
          </div>
        </div>

        {!activeFeature ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="group rounded-2xl border border-border bg-card backdrop-blur-sm shadow-lg p-6 cursor-pointer transition-all hover:shadow-2xl hover:scale-105 hover:border-green-300"
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <div className="flex flex-col">
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-br ${feature.bgGradient} w-fit mb-4 group-hover:shadow-md transition-all`}
                    >
                      <Icon className={`h-8 w-8 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} style={{WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {feature.description}
                    </p>
                    <Button 
                      className={`w-full bg-gradient-to-r ${feature.gradient} text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg transition-all`}
                    >
                      Open Feature
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <Button
              onClick={() => setActiveFeature(null)}
              variant="outline"
              className="mb-4 border-border hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300"
            >
              ← Back to Features
            </Button>
            <div className="rounded-2xl border border-border bg-card backdrop-blur-sm shadow-lg p-6">
              {renderFeature()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
