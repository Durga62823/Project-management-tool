'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListTodo, MessageSquare, BarChart, FileText, Sparkles, ArrowLeft } from 'lucide-react';
import { TaskPrioritization } from '@/components/lead/TaskPrioritization';
import { StandupSummary } from '@/components/lead/StandupSummary';
import { SprintRetrospective } from '@/components/lead/SprintRetrospective';
import { ReportGeneration } from '@/components/shared/ReportGeneration';

type AIFeature = 'task-prioritization' | 'standup-summary' | 'retrospective' | 'report-generation' | null;

export default function LeadAIFeaturesPage() {
  const [activeFeature, setActiveFeature] = useState<AIFeature>(null);

  const features = [
    {
      id: 'task-prioritization' as const,
      title: 'Smart Task Prioritization',
      description: 'Auto-prioritize backlog, suggest assignments, and identify dependencies',
      icon: ListTodo,
      gradient: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50',
    },
    {
      id: 'standup-summary' as const,
      title: 'Daily Standup Summary',
      description: 'Analyze team updates, identify blockers, and generate action items',
      icon: MessageSquare,
      gradient: 'from-teal-500 to-cyan-500',
      bgGradient: 'from-teal-50 to-cyan-50',
    },
    {
      id: 'retrospective' as const,
      title: 'Sprint Retrospective Assistant',
      description: 'Analyze sprint metrics and generate improvement suggestions',
      icon: BarChart,
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-50 to-purple-50',
    },
    {
      id: 'report-generation' as const,
      title: 'Smart Report Generator',
      description: 'Generate comprehensive project reports with insights',
      icon: FileText,
      gradient: 'from-orange-500 to-rose-500',
      bgGradient: 'from-orange-50 to-rose-50',
    },
  ];

  const renderFeature = () => {
    switch (activeFeature) {
      case 'task-prioritization':
        return <TaskPrioritization />;
      case 'standup-summary':
        return <StandupSummary />;
      case 'retrospective':
        return <SprintRetrospective />;
      case 'report-generation':
        return <ReportGeneration />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-primary-foreground rounded-full shadow-lg w-fit mb-3">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold">AI Powered</span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Lead AI Features
        </h1>
        <p className="text-primary mt-2">
          AI-powered tools to enhance team leadership and sprint management
        </p>
      </div>

      {!activeFeature ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="p-6 cursor-pointer border-border bg-card backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 hover:border-purple-300"
                onClick={() => setActiveFeature(feature.id)}
              >
                <div className="flex flex-col">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${feature.bgGradient} w-fit mb-4 shadow-md`}>
                    <Icon className={`h-8 w-8 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-primary mb-4 flex-grow">{feature.description}</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:scale-105 transition-all duration-300" 
                    variant="default"
                  >
                    Open Feature
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div>
          <Button
            onClick={() => setActiveFeature(null)}
            variant="outline"
            className="mb-4 border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Features
          </Button>
          <Card className="p-6 border-border bg-card backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            {renderFeature()}
          </Card>
        </div>
      )}
    </div>
  );
}
