"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatTime12Hour } from "@/lib/utils";
import { WeeklyAvailability, Booking, IntervalType } from "@/lib/types";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Check,
  Calendar as CalendarIcon,
} from "lucide-react";

type BookingStep = "duration" | "details" | "success";

export default function BookingPage() {
  const params = useParams();
  const userId = params.id as string;

  const [step, setStep] = React.useState<BookingStep>("duration");
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [interval, setInterval] = React.useState<IntervalType>(30);
  const [availability, setAvailability] = React.useState<WeeklyAvailability>(
    {}
  );
  const [specificDates, setSpecificDates] = React.useState<string[]>([]);
  const [dateRanges, setDateRanges] = React.useState<
    { start: string; end: string }[]
  >([]);
  const [availabilityEntries, setAvailabilityEntries] = React.useState<any[]>(
    []
  );
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [bookingStatus, setBookingStatus] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [userName, setUserName] = React.useState<string>("");
  const [bookingDetails, setBookingDetails] = React.useState<{
    name: string;
    email: string;
  } | null>(null);

  const fetchAvailability = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `/api/availability/${userId}${
          date ? `?date=${date.toISOString()}` : ""
        }`
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
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        date: date?.toISOString(),
        time: selectedTime,
        duration: interval,
        userId: userId,
      }),
    });

    if (response.ok) {
      setBookingDetails({ name, email });
      setStep("success");
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-6xl">
        {step === "duration" && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Book a meeting in seconds
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-2">Schedule Your Meeting</h1>
              <p className="text-gray-600">
                Choose your preferred duration, pick a time that works for you,
                and we'll take care of the rest
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-semibold">Meeting Duration</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {([15, 30, 45, 60] as IntervalType[]).map((int) => (
                    <button
                      key={int}
                      onClick={() => {
                        setInterval(int);
                        setSelectedTime(null);
                      }}
                      className={cn(
                        "relative rounded-lg px-6 py-4 text-sm font-medium transition-all border-2",
                        interval === int
                          ? "border-black bg-white shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      {int === 30 && (
                        <span className="absolute -top-2 right-2 bg-black text-white text-xs px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                      {int === 60 ? "1 hour" : `${int} min`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-5 h-5" />
                    <h3 className="font-semibold">Pick a Date</h3>
                  </div>
                  <Calendar
                    mode="single"
                    defaultMonth={date}
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate || undefined);
                      setSelectedTime(null);
                    }}
                    className="rounded-lg border"
                    disabled={(date) => !isDateAvailable(date)}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5" />
                    <h3 className="font-semibold">Select Time</h3>
                  </div>
                  {date ? (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        {date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      {timeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={cn(
                                "rounded-lg px-4 py-2.5 text-sm font-medium transition-all border",
                                selectedTime === time
                                  ? "bg-gray-900 text-white border-gray-900"
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              )}
                            >
                              {formatTime12Hour(time)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No available time slots for this day
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Please select a date first
                    </p>
                  )}
                </div>
              </div>

              {selectedTime && date && (
                <button
                  onClick={() => setStep("details")}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-6 py-3 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Details
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>
          </div>
        )}

        {step === "details" && date && selectedTime && (
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
            <button
              onClick={() => setStep("duration")}
              className="flex items-center gap-2 text-sm mb-6 hover:text-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Almost there!</h1>
              <p className="text-gray-600">
                Just need a few details to confirm your booking
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="bg-gray-900 rounded-full p-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Your {interval} minute meeting
                  </p>
                  <p className="font-semibold text-lg">
                    {date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-700">
                    {formatTime12Hour(selectedTime)}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <button
                type="submit"
                disabled={bookingStatus === "Sending..."}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-6 py-3 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bookingStatus === "Sending..."
                  ? "Sending..."
                  : "Confirm Booking"}
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
              {bookingStatus && bookingStatus !== "Sending..." && (
                <p className="text-center text-sm text-red-600">
                  {bookingStatus}
                </p>
              )}
            </form>
          </div>
        )}

        {step === "success" && date && selectedTime && bookingDetails && (
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">You're all set!</h1>
              <p className="text-gray-600">
                We've sent a confirmation email to{" "}
                <span className="font-medium">{bookingDetails.email}</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{interval} minutes</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">
                    {date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium">
                    {formatTime12Hour(selectedTime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{bookingDetails.name}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setStep("duration");
                setDate(undefined);
                setSelectedTime(null);
                setBookingDetails(null);
                setBookingStatus("");
              }}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg px-6 py-3 font-medium transition-colors"
            >
              Book Another Meeting
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
