"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatTime12Hour } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { DatePicker } from "@/components/ui/date-picker";

type TimeSlot = {
  start: string;
  end: string;
};

type DayAvailability = {
  available: boolean;
  slots: TimeSlot[];
};

type WeeklyAvailability = {
  [key: number]: DayAvailability;
};

type Booking = {
  startTime: string;
  endTime: string;
};

type AvailabilityType = "RECURRING" | "DATE_RANGE" | "SPECIFIC_DATE";

type AvailabilityEntry = {
  id: string;
  type: AvailabilityType;
  dayOfWeek: number | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string;
  endTime: string;
};

type IntervalType = 15 | 30 | 60;

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [interval, setInterval] = React.useState<IntervalType>(30);
  const [availability, setAvailability] = React.useState<WeeklyAvailability>(
    {}
  );
  const [specificDates, setSpecificDates] = React.useState<string[]>([]);
  const [dateRanges, setDateRanges] = React.useState<
    { start: string; end: string }[]
  >([]);
  const [availabilityEntries, setAvailabilityEntries] = React.useState<
    AvailabilityEntry[]
  >([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [bookingStatus, setBookingStatus] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [showAvailability, setShowAvailability] = React.useState(false);

  const [availabilityType, setAvailabilityType] =
    React.useState<AvailabilityType>("RECURRING");
  const [selectedDays, setSelectedDays] = React.useState<number[]>([]);
  const [rangeStart, setRangeStart] = React.useState<Date | undefined>();
  const [rangeEnd, setRangeEnd] = React.useState<Date | undefined>();
  const [specificDate, setSpecificDate] = React.useState<Date | undefined>();
  const [timeStart, setTimeStart] = React.useState("09:00");
  const [timeEnd, setTimeEnd] = React.useState("17:00");

  const { data: session } = useSession();

  const fetchAvailability = async () => {
    if (!session?.user?.id || !date) return;

    try {
      const response = await fetch(
        `/api/availability/${session.user.id}?date=${date.toISOString()}`
      );
      const data = await response.json();
      setAvailability(data.weekly);
      setSpecificDates(data.specificDates || []);
      setDateRanges(data.dateRanges || []);
      setAvailabilityEntries(data.all);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAvailability();
  }, [session?.user?.id, date]);

  React.useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user?.id || !date) return;

      try {
        const response = await fetch(
          `/api/booking/${session.user.id}?date=${encodeURIComponent(
            date.toISOString()
          )}`
        );

        if (!response.ok) {
          const text = await response.text();
          console.error(
            "Error fetching bookings (status):",
            response.status,
            text
          );
          return;
        }

        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [session?.user?.id, date]);

  const isDateAvailable = (checkDate: Date): boolean => {
    const dayOfWeek = checkDate.getDay();

    if (availability[dayOfWeek]?.available) {
      return true;
    }

    const checkDateOnly = new Date(checkDate);
    checkDateOnly.setHours(0, 0, 0, 0);

    const isSpecificDate = specificDates.some((d) => {
      const specificDate = new Date(d);
      specificDate.setHours(0, 0, 0, 0);
      return specificDate.getTime() === checkDateOnly.getTime();
    });

    if (isSpecificDate) return true;

    const isInRange = dateRanges.some((range) => {
      const rangeStartDate = new Date(range.start);
      rangeStartDate.setHours(0, 0, 0, 0);
      const rangeEndDate = new Date(range.end);
      rangeEndDate.setHours(23, 59, 59, 999);
      return checkDateOnly >= rangeStartDate && checkDateOnly <= rangeEndDate;
    });

    return isInRange;
  };

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
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
    }
  };

  const isTimeSlotBooked = (time: string): boolean => {
    if (!date) return false;

    const [hours, minutes] = time.split(":").map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hours, minutes, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + interval);

    return bookings.some((booking) => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      return (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd)
      );
    });
  };

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingStatus("Sending...");

    const formData = new FormData(e.currentTarget);

    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        date: date?.toISOString(),
        time: selectedTime,
        duration: interval,
        userId: session?.user?.id,
      }),
    });

    if (response.ok) {
      setBookingStatus("✓ Booking confirmed! Check your email.");

      const updatedBookingsResponse = await fetch(
        `/api/booking/${session?.user?.id}?date=${encodeURIComponent(
          date?.toISOString() || ""
        )}`
      );
      if (updatedBookingsResponse.ok) {
        const updatedBookings = await updatedBookingsResponse.json();
        setBookings(updatedBookings);
      }

      setTimeout(() => {
        setSelectedTime(null);
        setBookingStatus("");
      }, 3000);
    } else {
      setBookingStatus("✗ Failed to book. Try again.");
    }
  };

  const generateTimeSlots = (date: Date): string[] => {
    const dayOfWeek = date.getDay();
    let dayAvailability = availability[dayOfWeek];

    if (!dayAvailability?.available) {
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      const matchingEntry = availabilityEntries.find((entry) => {
        if (entry.type === "SPECIFIC_DATE" && entry.startDate) {
          const specificDate = new Date(entry.startDate);
          specificDate.setHours(0, 0, 0, 0);
          return specificDate.getTime() === dateOnly.getTime();
        } else if (
          entry.type === "DATE_RANGE" &&
          entry.startDate &&
          entry.endDate
        ) {
          const rangeStartDate = new Date(entry.startDate);
          rangeStartDate.setHours(0, 0, 0, 0);
          const rangeEndDate = new Date(entry.endDate);
          rangeEndDate.setHours(23, 59, 59, 999);
          return dateOnly >= rangeStartDate && rangeEndDate >= dateOnly;
        }
        return false;
      });

      if (matchingEntry) {
        dayAvailability = {
          available: true,
          slots: [
            { start: matchingEntry.startTime, end: matchingEntry.endTime },
          ],
        };
      } else {
        return [];
      }
    }

    const slots: string[] = [];

    dayAvailability.slots.forEach((slot) => {
      const [startHour, startMin] = slot.start.split(":").map(Number);
      const [endHour, endMin] = slot.end.split(":").map(Number);

      let currentTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      while (currentTime < endTime) {
        const hours = Math.floor(currentTime / 60);
        const minutes = currentTime % 60;
        const timeString = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;

        if (!isTimeSlotBooked(timeString)) {
          slots.push(timeString);
        }

        currentTime += interval;
      }
    });

    return slots;
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

  const timeSlots = date ? generateTimeSlots(date) : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col gap-6 w-full max-w-7xl">
        <div className="flex justify-between items-center">
          <h1>Welcome {session?.user?.name}</h1>
          <button
            onClick={() => setShowAvailability(!showAvailability)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {showAvailability ? "Hide" : "Manage"} Availability
          </button>
        </div>

        {showAvailability && (
          <div className="rounded-lg border p-6 shadow-sm space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-semibold">Add Availability</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Availability Type
                  </label>
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
                      Specific Date
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
                      Recurring Weekly
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
                      Date Range
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
                    <label className="text-sm font-medium">
                      Select Date Range
                    </label>
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
                  <p className="text-sm text-muted-foreground">
                    No availability set
                  </p>
                )}
                {availabilityEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {entry.type === "RECURRING" && "🔄 Recurring"}
                        {entry.type === "DATE_RANGE" && "📅 Date Range"}
                        {entry.type === "SPECIFIC_DATE" && "📌 Specific Date"}
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
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col gap-4">
            <Calendar
              mode="single"
              defaultMonth={date}
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate || undefined);
                setSelectedTime(null);
              }}
              className="rounded-lg border shadow-sm"
              disabled={(date) => !isDateAvailable(date)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-lg border p-4 shadow-sm">
              <h3 className="mb-3 font-semibold">Booking Interval</h3>
              <div className="flex gap-2">
                {([15, 30, 60] as IntervalType[]).map((int) => (
                  <button
                    key={int}
                    onClick={() => {
                      setInterval(int);
                      setSelectedTime(null);
                    }}
                    className={cn(
                      "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      interval === int
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {int} min
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-row gap-5">
              {date && (
                <div className="rounded-lg border p-4 shadow-sm">
                  <h3 className="mb-3 font-semibold">
                    Available Times - {date.toLocaleDateString()}
                  </h3>
                  {timeSlots.length > 0 ? (
                    <div className="grid max-h-[400px] grid-cols-3 gap-2 overflow-y-auto">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            selectedTime === time
                              ? "bg-primary text-primary-foreground"
                              : "border hover:bg-secondary"
                          )}
                        >
                          {formatTime12Hour(time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No available time slots for this day
                    </p>
                  )}
                </div>
              )}

              {selectedTime && date && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg border bg-muted p-4 shadow-sm">
                    <h3 className="mb-2 font-semibold">Selected Booking</h3>
                    <p className="text-sm">
                      <span className="font-medium">Date:</span>{" "}
                      {date.toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Time:</span> {selectedTime}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Duration:</span> {interval}{" "}
                      minutes
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 shadow-sm">
                    <h3 className="mb-3 font-semibold">Confirm Booking</h3>
                    <form onSubmit={handleBooking} className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                          placeholder="john@example.com"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={bookingStatus === "Sending..."}
                        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {bookingStatus === "Sending..."
                          ? "Sending..."
                          : "Confirm Booking"}
                      </button>
                      {bookingStatus && bookingStatus !== "Sending..." && (
                        <p
                          className={cn(
                            "text-center text-sm",
                            bookingStatus.startsWith("✓")
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {bookingStatus}
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
