import { NextResponse } from "next/server";
import ical from "ical-generator";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { name, email, date, time, duration, userId, eventTypeId } =
    await request.json();

  const [hours, minutes] = time.split(":").map(Number);
  const startDate = new Date(date);
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + duration);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, timezone: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        eventTypeId,
        guestName: name,
        guestEmail: email,
        startTime: startDate,
        endTime: endDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: "CONFIRMED",
      },
    });

    const calendar = ical({ name: "Meeting Booking" });
    calendar.createEvent({
      start: startDate,
      end: endDate,
      summary: `Meeting with ${user.name}`,
      description: "Scheduled meeting",
      location: "Video Call Link Here",
      organizer: {
        name: user.name || "Host",
        email: user.email,
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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Meeting Confirmed ✓",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your meeting is confirmed!</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Date:</strong> ${startDate.toLocaleDateString()}</p>
          <p style="margin: 10px 0;"><strong>Time:</strong> ${startDate.toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" }
          )}</p>
          <p style="margin: 10px 0;"><strong>Duration:</strong> ${duration} minutes</p>
        </div>
        
        <p><strong>📅 Add to Calendar:</strong> The calendar invite is attached to this email.</p>
      </div>
    `,
      icalEvent: {
        method: "REQUEST",
        content: calendar.toString(),
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `New Booking: ${name}`,
      html: `
      <h2>New Meeting Scheduled</h2>
      <p><strong>Guest:</strong> ${name} (${email})</p>
      <p><strong>Date:</strong> ${startDate.toLocaleString()}</p>
      <p><strong>Duration:</strong> ${duration} minutes</p>
    `,
      icalEvent: {
        method: "REQUEST",
        content: calendar.toString(),
      },
    });

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
