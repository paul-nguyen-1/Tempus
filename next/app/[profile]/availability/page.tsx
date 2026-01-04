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
      return `${DAYS[entry.dayOfWeek!]} - ${entry.startTime} to ${
        entry.endTime
      }`;
    } else if (entry.type === "DATE_RANGE") {
      return `${new Date(entry.startDate!).toLocaleDateString()} - ${new Date(
        entry.endDate!
      ).toLocaleDateString()}: ${entry.startTime} to ${entry.endTime}`;
    } else {
      return `${new Date(entry.startDate!).toLocaleDateString()}: ${
        entry.startTime
      } to ${entry.endTime}`;
    }
  };

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
    <div className="rounded-lg border p-6 shadow-sm space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Add Availability</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Availability Type</label>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setAvailabilityType("SPECIFIC_DATE")}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium",
                  availabilityType === "SPECIFIC_DATE"
                    ? "bg-primary text-primary-foreground"
                    : "border hover:bg-secondary"
                )}
              >
                Day
              </button>
              <button
                onClick={() => setAvailabilityType("RECURRING")}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium",
                  availabilityType === "RECURRING"
                    ? "bg-primary text-primary-foreground"
                    : "border hover:bg-secondary"
                )}
              >
                Weekly
              </button>
              <button
                onClick={() => setAvailabilityType("DATE_RANGE")}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium",
                  availabilityType === "DATE_RANGE"
                    ? "bg-primary text-primary-foreground"
                    : "border hover:bg-secondary"
                )}
              >
                Range
              </button>
            </div>
          </div>

          {availabilityType === "RECURRING" && (
            <div>
              <label className="text-sm font-medium">
                Select Days (multiple)
              </label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {DAYS.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => toggleDay(index)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium",
                      selectedDays.includes(index)
                        ? "bg-primary text-primary-foreground"
                        : "border hover:bg-secondary"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {selectedDays.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Selected: {selectedDays.map((d) => DAYS[d]).join(", ")}
                </p>
              )}
            </div>
          )}

          {availabilityType === "DATE_RANGE" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date Range</label>
              <div className="flex flex-col sm:flex-row gap-3">
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
              <p className="text-xs text-muted-foreground">
                {rangeStart && rangeEnd
                  ? `Selected: ${rangeStart.toLocaleDateString()} - ${rangeEnd.toLocaleDateString()}`
                  : "Pick a start and end date"}
              </p>
            </div>
          )}

          {availabilityType === "SPECIFIC_DATE" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <DatePicker
                value={specificDate}
                onChange={setSpecificDate}
                placeholder="Select date"
              />
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Start Time</label>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">End Time</label>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSaveAvailability}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Availability
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Current Availability</h3>
        <div className="space-y-2">
          {availabilityEntries.length === 0 && (
            <p className="text-sm text-muted-foreground">No availability set</p>
          )}
          {availabilityEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {entry.type === "RECURRING" && "🔄 Weekly"}
                  {entry.type === "DATE_RANGE" && "📅 Range"}
                  {entry.type === "SPECIFIC_DATE" && "📌 Day"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatAvailabilityEntry(entry)}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAvailability(entry.id)}
                className="rounded-md border border-red-500 px-3 py-1 text-sm text-red-500 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
