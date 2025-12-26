import { redirect } from "next/navigation";
import { Settings, Clock, Calendar, Globe, Bot, Shield } from "lucide-react";

import { auth } from "@/lib/auth";
import { getOrganizationSettings } from "@/app/actions/admin-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const settings = await getOrganizationSettings();

  if (!settings) {
    return <div>Failed to load settings</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header with gradient badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary shadow-lg">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              Admin - Organization Settings
            </h2>
            <p className="text-muted-foreground mt-1">
              Configure global settings for your organization
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border bg-card backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Time & Location
              </CardTitle>
              <CardDescription>
                Timezone and working hours configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Timezone</span>
                <Badge variant="outline" className="border-primary/20 text-primary">
                  {settings.timeZone}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Work Week</span>
                <Badge variant="outline" className="border-primary/20 text-primary">
                  {settings.workWeek}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Working Hours</span>
                <Badge variant="outline" className="border-primary/20 text-primary">
                  {settings.workHoursStart} - {settings.workHoursEnd}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Features
              </CardTitle>
              <CardDescription>
                Artificial intelligence and automation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">AI Enabled</span>
                <Badge 
                  variant={settings.aiEnabled ? "default" : "secondary"}
                  className={settings.aiEnabled ? "bg-primary text-primary-foreground" : ""}
                >
                  {settings.aiEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">AI Threshold</span>
                <Badge variant="outline" className="border-primary/20 text-primary">
                  {(settings.aiThreshold * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Holidays
              </CardTitle>
              <CardDescription>
                Organizational holidays and time-off days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {settings.holidays || "No holidays configured"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                System Info
              </CardTitle>
              <CardDescription>
                System configuration and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(settings.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
