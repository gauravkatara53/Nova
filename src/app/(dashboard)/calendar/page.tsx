"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getColdEmails } from "@/actions/cold-emails";
import { getApplications } from "@/actions/applications";
import { getFollowUps } from "@/actions/follow-ups";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type CalendarEvent = {
  type: "follow-up" | "deadline" | "applied" | "interview" | "follow-up-due";
  title: string;
  color: string;
  detail?: string;
};

function buildEventsMap(
  coldEmails: any[],
  applications: any[],
  followUps: any[]
): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};

  const addEvent = (dateStr: string, event: CalendarEvent) => {
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(event);
  };

  const toKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Cold emails — follow-up dates and sent dates
  for (const email of coldEmails) {
    if (email.followUpDate) {
      const d = new Date(email.followUpDate);
      addEvent(toKey(d), {
        type: "follow-up",
        title: `Follow-up: ${email.recipientName}${email.company?.name ? ` @ ${email.company.name}` : ""}`,
        color: "bg-blue-500",
        detail: email.role ? `Role: ${email.role}` : undefined,
      });
    }
  }

  // Job applications — deadlines, applied dates, interviews
  for (const app of applications) {
    if (app.deadline) {
      const d = new Date(app.deadline);
      addEvent(toKey(d), {
        type: "deadline",
        title: `Deadline: ${app.role}${app.company?.name ? ` @ ${app.company.name}` : ""}`,
        color: "bg-red-500",
        detail: app.notes || undefined,
      });
    }
    if (app.appliedDate) {
      const d = new Date(app.appliedDate);
      addEvent(toKey(d), {
        type: "applied",
        title: `Applied: ${app.role}${app.company?.name ? ` @ ${app.company.name}` : ""}`,
        color: "bg-violet-500",
        detail: app.location || undefined,
      });
    }
    if (app.status === "INTERVIEW" && app.updatedAt) {
      // No explicit interview date field, so we skip unless one exists
    }
  }

  // Follow-ups from the FollowUp model
  for (const fu of followUps) {
    const d = new Date(fu.dueDate);
    const typeLabel = fu.type === "FIRST" ? "1st" : fu.type === "SECOND" ? "2nd" : "Final";
    addEvent(toKey(d), {
      type: "follow-up-due",
      title: `${typeLabel} Follow-up: ${fu.coldEmail.recipientName}${fu.coldEmail.company?.name ? ` @ ${fu.coldEmail.company.name}` : ""}`,
      color: "bg-amber-500",
      detail: fu.coldEmail.role || undefined,
    });
  }

  return map;
}

const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  "follow-up": { label: "Email Follow-ups", color: "bg-blue-500" },
  "deadline": { label: "App Deadlines", color: "bg-red-500" },
  "applied": { label: "Applied", color: "bg-violet-500" },
  "follow-up-due": { label: "Scheduled Follow-ups", color: "bg-amber-500" },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<{ day: number; events: CalendarEvent[] } | null>(null);

  const { data: coldEmails = [], isLoading: loadingEmails } = useQuery({
    queryKey: ["cold-emails"],
    queryFn: () => getColdEmails(),
  });

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ["applications"],
    queryFn: () => getApplications(),
  });

  const { data: followUps = [], isLoading: loadingFollowUps } = useQuery({
    queryKey: ["follow-ups"],
    queryFn: () => getFollowUps(),
  });

  const isLoading = loadingEmails || loadingApps || loadingFollowUps;
  const eventsMap = buildEventsMap(coldEmails, applications, followUps);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const getDateKey = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  // Count total events in current month
  const totalMonthEvents = Array.from({ length: daysInMonth }).reduce<number>((sum, _, i) => {
    const key = getDateKey(i + 1);
    return sum + (eventsMap[key]?.length || 0);
  }, 0);

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Track follow-ups, interviews, and deadlines"
      />

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">
                  {MONTHS[month]} {year}
                </CardTitle>
                {totalMonthEvents > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {totalMonthEvents} event{totalMonthEvents !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="text-xs" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px border-b">
                {DAYS.map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px">
                {/* Empty cells for days before first of month */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] p-1" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = getDateKey(day);
                  const dayEvents = eventsMap[dateKey] || [];
                  const isToday =
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();

                  return (
                    <div
                      key={day}
                      onClick={() => {
                        if (dayEvents.length > 0) {
                          setSelectedDay({ day, events: dayEvents });
                        }
                      }}
                      className={cn(
                        "min-h-[100px] border-b border-r p-1 transition-colors",
                        dayEvents.length > 0
                          ? "cursor-pointer hover:bg-accent/50"
                          : "hover:bg-accent/30",
                        isToday && "bg-accent/50"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                          isToday && "bg-violet-600 text-white font-bold"
                        )}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 3).map((event, j) => (
                          <div
                            key={j}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] text-white truncate",
                              event.color
                            )}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-muted-foreground px-1.5">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4">
            {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className={cn("h-3 w-3 rounded", config.color)} />
                {config.label}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Day detail dialog */}
      <Dialog
        open={!!selectedDay}
        onOpenChange={(open) => {
          if (!open) setSelectedDay(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && `${MONTHS[month]} ${selectedDay.day}, ${year}`}
            </DialogTitle>
            <DialogDescription>
              {selectedDay?.events.length} event{selectedDay?.events.length !== 1 ? "s" : ""} on this day
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {selectedDay?.events.map((event, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", event.color)} />
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.detail && (
                    <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>
                  )}
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    {EVENT_TYPE_CONFIG[event.type]?.label || event.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
