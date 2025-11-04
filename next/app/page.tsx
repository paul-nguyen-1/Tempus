"use client";
import { Calendar } from "@/components/ui/calendar";
import * as React from "react";
import { cn, formatTime12Hour } from "@/lib/utils";

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

// Mocked availability data
const DEFAULT_AVAILABILITY: WeeklyAvailability = {
  1: { available: true, slots: [{ start: "09:00", end: "17:00" }] },
  2: { available: true, slots: [{ start: "09:00", end: "17:00" }] },
  3: { available: true, slots: [{ start: "09:00", end: "17:00" }] },
  4: { available: true, slots: [{ start: "09:00", end: "17:00" }] },
  5: { available: true, slots: [{ start: "09:00", end: "12:00" }] },
  0: { available: false, slots: [] },
  6: { available: false, slots: [] },
};

type IntervalType = 15 | 30 | 60;

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [interval, setInterval] = React.useState<IntervalType>(30);
  const [availability] =
    React.useState<WeeklyAvailability>(DEFAULT_AVAILABILITY);
  const [bookingStatus, setBookingStatus] = React.useState<string>("");

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
      }),
    });

    if (response.ok) {
      setBookingStatus("✓ Booking confirmed! Check your email.");
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
    const dayAvailability = availability[dayOfWeek];

    if (!dayAvailability?.available) return [];

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
        slots.push(timeString);
        currentTime += interval;
      }
    });

    return slots;
  };

  const timeSlots = date ? generateTimeSlots(date) : [];

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-col gap-4">
          <Calendar
            mode="single"
            defaultMonth={date}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              setSelectedTime(null);
            }}
            className="rounded-lg border shadow-sm"
            disabled={(date) => {
              const dayOfWeek = date.getDay();
              return !availability[dayOfWeek]?.available;
            }}
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
  );
}
