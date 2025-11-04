import { NextResponse } from "next/server";
import ical from "ical-generator";
import nodemailer from "nodemailer";
import { formatTime12Hour } from "@/lib/utils";

export async function POST(request: Request) {
  const { name, email, date, time, duration } = await request.json();

  const [hours, minutes] = time.split(":").map(Number);
  const startDate = new Date(date);
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + duration);

  const calendar = ical({ name: "Interview Booking" });
  calendar.createEvent({
    start: startDate,
    end: endDate,
    summary: `Interview with ${name}`,
    description: "Scheduled interview",
    location: "Video Call Link Here",
    organizer: {
      name: "Your Company",
      email: process.env.ORGANIZER_EMAIL!,
    },
    attendees: [{ name, email }],
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Interview Confirmed",
      html: `
        <h2>Your interview is confirmed!</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Date:</strong> ${startDate.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${formatTime12Hour(time)}</p>
        <p><strong>Duration:</strong> ${duration} minutes</p>
        <p>The calendar invite is attached to this email.</p>
      `,
      icalEvent: {
        method: "REQUEST",
        content: calendar.toString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to send booking confirmation" },
      { status: 500 }
    );
  }
}
