"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { DatePicker } from "@/components/ui/date-picker";
import { AvailabilityEntry, AvailabilityType } from "@/lib/types";
import { DAYS } from "@/lib/const";

interface AvailabilityProps {
  onAvailabilityUpdate?: () => void;
}

export default function Availability({
  onAvailabilityUpdate,
}: AvailabilityProps) {
  const [selectedDays, setSelectedDays] = React.useState<number[]>([]);
  const [rangeStart, setRangeStart] = React.useState<Date | undefined>();
  const [rangeEnd, setRangeEnd] = React.useState<Date | undefined>();
  const [specificDate, setSpecificDate] = React.useState<Date | undefined>();
  const [timeStart, setTimeStart] = React.useState("09:00");
  const [timeEnd, setTimeEnd] = React.useState("17:00");
  const [availabilityType, setAvailabilityType] =
    React.useState<AvailabilityType>("RECURRING");
  const [availabilityEntries, setAvailabilityEntries] = React.useState<
    AvailabilityEntry[]
  >([]);
  const [loading, setLoading] = React.useState(true);

  const { data: session } = useSession();

  const fetchAvailability = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(
        `/api/availability/${session.user.id}?date=${new Date().toISOString()}`
      );
      const data = await response.json();
      setAvailabilityEntries(data.all);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAvailability();
  }, [session?.user?.id]);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleSaveAvailability = async () => {
    if (!session?.user?.id) return;

    if (availabilityType === "RECURRING" && selectedDays.length === 0) {
      return;
    }

    if (availabilityType === "DATE_RANGE" && (!rangeStart || !rangeEnd)) {
      return;
    }

    if (availabilityType === "SPECIFIC_DATE" && !specificDate) {
      return;
    }

    try {
      if (availabilityType === "RECURRING") {
        await Promise.all(
          selectedDays.map((dayOfWeek) =>
            fetch("/api/availability", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: session.user.id,
                type: availabilityType,
                dayOfWeek,
                startTime: timeStart,
                endTime: timeEnd,
              }),
            })
          )
        );
      } else {
        const payload: any = {
          userId: session.user.id,
          type: availabilityType,
          startTime: timeStart,
          endTime: timeEnd,
        };

        if (availabilityType === "DATE_RANGE") {
          payload.startDate = rangeStart!.toISOString();
          payload.endDate = rangeEnd!.toISOString();
        } else if (availabilityType === "SPECIFIC_DATE") {
          payload.startDate = specificDate!.toISOString();
          payload.endDate = specificDate!.toISOString();
        }

        await fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      await fetchAvailability();
      onAvailabilityUpdate?.();
      setSelectedDays([]);
      setRangeStart(undefined);
      setRangeEnd(undefined);
      setSpecificDate(undefined);
    } catch (error) {
      console.error("Error saving availability:", error);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/availability", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchAvailability();
        onAvailabilityUpdate?.();
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
    }
  };

  const formatAvailabilityEntry = (entry: AvailabilityEntry) => {
    if (entry.type === "RECURRING") {
      return {
        title:
          entry.dayOfWeek !== undefined && entry.dayOfWeek !== null
            ? DAYS[entry.dayOfWeek]
            : "",
        time: `${entry.startTime} - ${entry.endTime}`,
      };
    } else if (entry.type === "DATE_RANGE") {
      return {
        title: `${new Date(entry.startDate!).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} - ${new Date(entry.endDate!).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`,
        time: `${entry.startTime} - ${entry.endTime}`,
      };
    } else {
      return {
        title: new Date(entry.startDate!).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: `${entry.startTime} - ${entry.endTime}`,
      };
    }
  };

  // Group entries by type for display
  const groupedEntries = React.useMemo(() => {
    const groups: {
      [key in AvailabilityType]: AvailabilityEntry[];
    } = {
      DATE_RANGE: [],
      SPECIFIC_DATE: [],
      RECURRING: [],
    };

    availabilityEntries.forEach((entry) => {
      groups[entry.type].push(entry);
    });

    return groups;
  }, [availabilityEntries]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Availability</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure when you're available for meetings
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Add Availability
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Configure available time slots
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900">
                Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAvailabilityType("SPECIFIC_DATE")}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium rounded-lg transition-all",
                    availabilityType === "SPECIFIC_DATE"
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  )}
                >
                  Day
                </button>
                <button
                  onClick={() => setAvailabilityType("RECURRING")}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium rounded-lg transition-all",
                    availabilityType === "RECURRING"
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  )}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setAvailabilityType("DATE_RANGE")}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium rounded-lg transition-all",
                    availabilityType === "DATE_RANGE"
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  )}
                >
                  Range
                </button>
              </div>
            </div>

            {availabilityType === "RECURRING" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  Days
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {DAYS.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => toggleDay(index)}
                      className={cn(
                        "px-4 py-3 text-sm font-medium rounded-xs transition-all text-left border",
                        selectedDays.includes(index)
                          ? "bg-gray-200 border-gray-900 text-gray-900"
                          : "bg-white border-gray-400 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availabilityType === "DATE_RANGE" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  Select Date Range
                </label>
                <div className="flex flex-row gap-2 space-y-3">
                  <DatePicker
                    value={rangeStart}
                    onChange={setRangeStart}
                    placeholder="From"
                  />
                  <DatePicker
                    value={rangeEnd}
                    onChange={setRangeEnd}
                    placeholder="To"
                  />
                </div>
              </div>
            )}

            {availabilityType === "SPECIFIC_DATE" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  Select Date
                </label>
                <DatePicker
                  value={specificDate}
                  onChange={setSpecificDate}
                  placeholder="Select date"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900">
                Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                />
                <input
                  type="time"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleSaveAvailability}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="text-lg">+</span>
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
            <p className="mt-1 text-sm text-gray-500">
              Configured availability slots
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {availabilityEntries.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-500">No availability set</p>
                </div>
              )}

              {groupedEntries.DATE_RANGE.map((entry) => {
                const formatted = formatAvailabilityEntry(entry);
                return (
                  <div
                    key={entry.id}
                    className="group flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="mt-0.5 shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                          strokeWidth="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Range
                      </div>
                      <div className="font-medium text-sm text-gray-900">
                        {formatted.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        {formatted.time}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAvailability(entry.id)}
                      className="shrink-0 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}

              {groupedEntries.SPECIFIC_DATE.map((entry) => {
                const formatted = formatAvailabilityEntry(entry);
                return (
                  <div
                    key={entry.id}
                    className="group flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="mt-0.5 shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                          strokeWidth="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Day
                      </div>
                      <div className="font-medium text-sm text-gray-900">
                        {formatted.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        {formatted.time}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAvailability(entry.id)}
                      className="shrink-0 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}

              {(() => {
                // Group recurring entries by their time slots
                const recurringByTime = groupedEntries.RECURRING.reduce(
                  (acc, entry) => {
                    const timeKey = `${entry.startTime}-${entry.endTime}`;
                    if (!acc[timeKey]) {
                      acc[timeKey] = [];
                    }
                    acc[timeKey].push(entry);
                    return acc;
                  },
                  {} as { [key: string]: AvailabilityEntry[] }
                );

                return Object.entries(recurringByTime).map(
                  ([timeKey, entries]) => {
                    const days = entries
                      .map((entry) =>
                        entry.dayOfWeek !== undefined &&
                        entry.dayOfWeek !== null
                          ? DAYS[entry.dayOfWeek]
                          : ""
                      )
                      .filter(Boolean)
                      .join(", ");
                    const [startTime, endTime] = timeKey.split("-");

                    return (
                      <div
                        key={timeKey}
                        className="group flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="mt-0.5 shrink-0">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                              strokeWidth="2"
                            />
                            <line
                              x1="16"
                              y1="2"
                              x2="16"
                              y2="6"
                              strokeWidth="2"
                            />
                            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                            <line
                              x1="3"
                              y1="10"
                              x2="21"
                              y2="10"
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Weekly
                          </div>
                          <div className="font-medium text-sm text-gray-900">
                            {days}
                          </div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            {startTime} - {endTime}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Delete all entries in this group
                            entries.forEach((entry) =>
                              handleDeleteAvailability(entry.id)
                            );
                          }}
                          className="shrink-0 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  }
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
