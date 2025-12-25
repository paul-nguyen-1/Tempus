"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatTime12Hour } from "@/lib/utils";
import { WeeklyAvailability, Booking, IntervalType } from "@/lib/types";
import { useParams } from "next/navigation";

export default function BookingPage() {
  const params = useParams();
  const userId = params.id as string;

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [interval, setInterval] = React.useState<IntervalType>(30);
  const [availability, setAvailability] = React.useState<WeeklyAvailability>(
    {}
  );
  const [specificDates, setSpecificDates] = React.useState<string[]>([]);
  const [dateRanges, setDateRanges] = React.useState<
    {
      start: string;
      end: string;
    }[]
  >([]);
  const [availabilityEntries, setAvailabilityEntries] = React.useState<any[]>(
    []
  );
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [bookingStatus, setBookingStatus] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [userName, setUserName] = React.useState<string>("");

  const fetchAvailability = async () => {
    if (!userId || !date) return;

    try {
      const response = await fetch(
        `/api/availability/${userId}?date=${date.toISOString()}`
      );
      const data = await response.json();
      setAvailability(data.weekly);
      setSpecificDates(data.specificDates || []);
      setDateRanges(data.dateRanges || []);
      setAvailabilityEntries(data.all);
      setUserName(data.userName || "User");
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAvailability();
  }, [userId, date]);

  React.useEffect(() => {
    const fetchBookings = async () => {
      if (!userId || !date) return;

      try {
        const response = await fetch(
          `/api/booking/${userId}?date=${encodeURIComponent(
            date.toISOString()
          )}`
        );

        if (!response.ok) {
          console.error("Error fetching bookings:", response.status);
          return;
        }

        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [userId, date]);

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
        userId: userId,
      }),
    });

    if (response.ok) {
      setBookingStatus("✓ Booking confirmed! Check your email.");

      const updatedBookingsResponse = await fetch(
        `/api/booking/${userId}?date=${encodeURIComponent(
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
        (e.target as HTMLFormElement).reset();
      }, 3000);
    } else {
      setBookingStatus("✗ Failed to book. Try again.");
    }
  };

  const timeSlots = date ? generateTimeSlots(date) : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col gap-6 w-full max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Book a meeting with {userName}
          </h1>
          <p className="text-muted-foreground">
            Select a date and time that works for you
          </p>
        </div>

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

          <div className="flex flex-col gap-4 flex-1">
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

            <div className="flex flex-col lg:flex-row gap-5">
              {date && (
                <div className="rounded-lg border p-4 shadow-sm flex-1">
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
                <div className="flex flex-col gap-4 lg:w-80">
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
