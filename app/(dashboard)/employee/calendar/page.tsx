"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  getMyCalendarEvents,
  getUpcomingEvents,
  getCalendarStats,
} from "@/app/actions/employee-calendar";

interface CalendarEvent {
  id: string;
  title: string;
  type: "task" | "meeting" | "deadline" | "milestone" | "appraisal" | "pto";
  date: Date;
  time?: string;
  priority?: string;
  status?: string;
  description?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  async function loadCalendarData() {
    setLoading(true);

    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const [eventsRes, upcomingRes] = await Promise.all([
      getMyCalendarEvents(startOfMonth, endOfMonth),
      getUpcomingEvents(),
    ]);

    if (eventsRes.success && eventsRes.data) {
      setEvents(eventsRes.data);
    }
    if (upcomingRes.success && upcomingRes.data) {
      setUpcomingEvents(upcomingRes.data);
    }

    setLoading(false);
  }

  function getDaysInMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  function getEventsForDate(date: Date) {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }

  function getEventTypeColor(type: string) {
    switch (type) {
      case "task":
        return "bg-primary/100";
      case "meeting":
        return "bg-primary/100";
      case "deadline":
        return "bg-primary/100";
      case "milestone":
        return "bg-primary/100";
      case "appraisal":
        return "bg-primary/100";
      case "pto":
        return "bg-primary/100";
      default:
        return "bg-primary/100";
    }
  }

  function getEventTypeBadge(type: string) {
    switch (type) {
      case "task":
        return "bg-primary/10 text-blue-800";
      case "meeting":
        return "bg-primary/10 text-purple-800";
      case "deadline":
        return "bg-primary/10 text-red-800";
      case "milestone":
        return "bg-primary/10 text-green-800";
      case "appraisal":
        return "bg-primary/10 text-yellow-800";
      case "pto":
        return "bg-primary/10 text-orange-800";
      default:
        return "bg-primary/10 text-gray-800";
    }
  }

  function getPriorityColor(priority?: string) {
    switch (priority) {
      case "high":
        return "text-primary";
      case "medium":
        return "text-primary";
      case "low":
        return "text-primary";
      default:
        return "text-primary";
    }
  }

  function previousMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  }

  function isToday(date: Date | null) {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  const days = getDaysInMonth();
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary shadow-lg">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              My Calendar
            </h1>
            <p className="text-primary mt-1">
              View your schedule and upcoming events
            </p>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card className="border-blue-300/60 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Upcoming Events
              </CardTitle>
            </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 bg-white rounded"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={getEventTypeBadge(event.type)}>
                      {event.type}
                    </Badge>
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

        {/* Calendar Navigation */}
        <Card className="border-border bg-card backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={previousMonth} className="hover:bg-primary/10 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                  className="hover:bg-primary/10 transition-colors"
                >
                  Today
                </Button>
                <Button size="sm" variant="outline" onClick={nextMonth} className="hover:bg-primary/10 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm py-2">
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isSelected =
                selectedDate &&
                day &&
                selectedDate.getDate() === day.getDate() &&
                selectedDate.getMonth() === day.getMonth();

              return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border rounded-xl cursor-pointer transition-all duration-300 ${
                      !day
                        ? "bg-primary/10/50"
                        : isToday(day)
                        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md"
                        : "bg-white/50 hover:bg-white/80 hover:shadow-lg hover:-translate-y-0.5"
                    } ${isSelected ? "ring-2 ring-blue-500 shadow-xl" : ""}`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                  {day && (
                    <>
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          isToday(day) ? "text-primary" : ""
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${getEventTypeColor(
                              event.type
                            )} text-primary-foreground`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

        {/* Selected Date Events */}
        {selectedDate && (
          <Card className="border-border bg-card backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>
              Events on{" "}
              {selectedDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No events on this day
              </p>
            ) : (
                <div className="space-y-3">
                  {selectedEvents.map((event) => (
                    <div key={event.id} className="border border-border rounded-xl p-4 bg-white/50 backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge className={getEventTypeBadge(event.type)}>
                            {event.type}
                          </Badge>
                          {event.priority && (
                            <Badge
                              variant="outline"
                              className={getPriorityColor(event.priority)}
                            >
                              {event.priority}
                            </Badge>
                          )}
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {event.time}
                          </div>
                        )}
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      {event.status && (
                        <Badge variant="outline">{event.status}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }
