import { redirect } from "next/navigation";
import { Github, Slack, Mail, Key, Zap, Shield } from "lucide-react";

import { auth } from "@/lib/auth";
import { getAllIntegrations } from "@/app/actions/admin-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const integrationIcons: Record<string, any> = {
  github: Github,
  slack: Slack,
  email: Mail,
  sso: Key,
  ai: Zap,
};

export default async function IntegrationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const integrations = await getAllIntegrations();

  // Default integrations if none exist
  const defaultIntegrations = [
    { name: "GitHub", type: "github", enabled: false, description: "Connect GitHub repositories for project tracking" },
    { name: "Slack", type: "slack", enabled: false, description: "Team communication and notifications" },
    { name: "Microsoft Teams", type: "teams", enabled: false, description: "Collaboration and chat integration" },
    { name: "Email", type: "email", enabled: true, description: "Email notifications and alerts" },
    { name: "SSO", type: "sso", enabled: false, description: "Single Sign-On authentication" },
    { name: "AI Assistant", type: "ai", enabled: true, description: "AI-powered suggestions and automation" },
  ];

  const displayIntegrations = integrations && integrations.length > 0 
    ? integrations.map(i => ({
        name: i.name,
        type: i.type,
        enabled: i.enabled,
        description: `Integration for ${i.name}`,
      }))
    : defaultIntegrations;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header with gradient badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Admin - Integrations
            </h2>
            <p className="text-slate-600 mt-1">
              Connect external services and configure integrations
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayIntegrations.map((integration) => {
            const Icon = integrationIcons[integration.type] || Zap;
            
            return (
              <Card 
                key={integration.name}
                className="border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-red-500" />
                    <Badge 
                      variant={integration.enabled ? "default" : "secondary"}
                      className={integration.enabled ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" : ""}
                    >
                      {integration.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant={integration.enabled ? "outline" : "default"} 
                    className={integration.enabled 
                      ? "w-full border-red-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 transition-all"
                      : "w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                    }
                  >
                    {integration.enabled ? "Configure" : "Enable"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
