"use client";

import { useState, useEffect } from "react";
import { useTransition } from "react";
import {
  updateUserPreferences,
  updateNotificationSettings,
} from "@/app/actions/settings";
import { Loader2 } from "lucide-react";

interface UserPreferences {
  theme?: string;
  language?: string;
  timezone?: string;
}

interface NotificationSettings {
  emailNotifications?: boolean;
  projectUpdates?: boolean;
  teamActivity?: boolean;
  loginAlerts?: boolean;
}

interface SettingsClientProps {
  initialPreferences?: UserPreferences;
  initialNotifications?: NotificationSettings;
}

export function SettingsClient({
  initialPreferences = {},
  initialNotifications = {
    emailNotifications: true,
    projectUpdates: true,
    teamActivity: true,
    loginAlerts: true,
  },
}: SettingsClientProps = {}) {
  const [preferencesPending, startPreferencesTransition] = useTransition();
  const [notificationsPending, startNotificationsTransition] = useTransition();

  // Preferences state
  const [theme, setTheme] = useState(initialPreferences.theme || "light");
  const [language, setLanguage] = useState(
    initialPreferences.language || "English"
  );
  const [timezone, setTimezone] = useState(
    initialPreferences.timezone || "UTC"
  );

  // Notifications state
  const [notifications, setNotifications] = useState(initialNotifications);

  // Function to apply theme to document
  const applyTheme = (themeValue: string) => {
    const htmlElement = document.documentElement;
    if (themeValue === "dark") {
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (themeValue === "light") {
      htmlElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else if (themeValue === "auto") {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
      localStorage.setItem("theme", "auto");
    }
  };

  // Apply theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Update theme handler
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handlePreferencesSave = () => {
    startPreferencesTransition(async () => {
      const result = await updateUserPreferences({
        theme,
        language,
        timezone,
      });

      if (result.success) {
        alert(result.message || "Preferences updated");
        applyTheme(theme);
      } else {
        alert("Error: " + result.error);
      }
    });
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNotificationsSave = () => {
    startNotificationsTransition(async () => {
      const result = await updateNotificationSettings(notifications);

      if (result.success) {
        alert(result.message || "Notification settings updated");
      } else {
        alert("Error: " + result.error);
      }
    });
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Preferences Section */}
      <div className="p-6 bg-card border border-border rounded-lg">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Preferences
        </h2>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Theme
            </label>
            <div className="space-y-3">
              <div className="flex items-center p-3 border border-border rounded-lg hover:bg-accent transition-colors">
                <input
                  type="radio"
                  id="light"
                  name="theme"
                  value="light"
                  checked={theme === "light"}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="light"
                  className="ml-3 text-sm text-foreground cursor-pointer flex-1"
                >
                  Light
                </label>
              </div>
              <div className="flex items-center p-3 border border-border rounded-lg hover:bg-accent transition-colors">
                <input
                  type="radio"
                  id="dark"
                  name="theme"
                  value="dark"
                  checked={theme === "dark"}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="dark"
                  className="ml-3 text-sm text-foreground cursor-pointer flex-1"
                >
                  Dark
                </label>
              </div>
              <div className="flex items-center p-3 border border-border rounded-lg hover:bg-accent transition-colors">
                <input
                  type="radio"
                  id="auto"
                  name="theme"
                  value="auto"
                  checked={theme === "auto"}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="auto"
                  className="ml-3 text-sm text-foreground cursor-pointer flex-1"
                >
                  Auto (based on system)
                </label>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg text-sm bg-background text-foreground cursor-pointer hover:border-ring transition-colors"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>

          {/* Timezone Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg text-sm bg-background text-foreground cursor-pointer hover:border-ring transition-colors"
            >
              <option>UTC</option>
              <option>EST (UTC-5)</option>
              <option>CST (UTC-6)</option>
              <option>MST (UTC-7)</option>
              <option>PST (UTC-8)</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={handlePreferencesSave}
            disabled={preferencesPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {preferencesPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="p-6 bg-card border border-border rounded-lg">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Notification Settings
        </h2>

        <div className="space-y-3 mb-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">
                Email Notifications
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Receive updates via email
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailNotifications || false}
              onChange={() => handleNotificationChange("emailNotifications")}
              className="w-5 h-5 ml-4 cursor-pointer"
            />
          </div>

          {/* Project Updates */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">
                Project Updates
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Get notified about project changes
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.projectUpdates || false}
              onChange={() => handleNotificationChange("projectUpdates")}
              className="w-5 h-5 ml-4 cursor-pointer"
            />
          </div>

          {/* Team Activity */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">
                Team Activity
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Notifications about your team
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.teamActivity || false}
              onChange={() => handleNotificationChange("teamActivity")}
              className="w-5 h-5 ml-4 cursor-pointer"
            />
          </div>

          {/* Login Alerts */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">
                Login Alerts
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Get notified of unusual login activity
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.loginAlerts || false}
              onChange={() => handleNotificationChange("loginAlerts")}
              className="w-5 h-5 ml-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleNotificationsSave}
          disabled={notificationsPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {notificationsPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Notification Settings"
          )}
        </button>
      </div>
    </div>
  );
}
