import { NextResponse } from "next/server";
import ical from "ical-generator";
import nodemailer from "nodemailer";

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
      subject: "Interview Confirmed ✓",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your interview is confirmed!</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Date:</strong> ${startDate.toLocaleDateString()}</p>
          <p style="margin: 10px 0;"><strong>Time:</strong> ${startDate.toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" }
          )}</p>
          <p style="margin: 10px 0;"><strong>Duration:</strong> ${duration} minutes</p>
        </div>
        
        <p><strong>📅 Add to Calendar:</strong> The calendar invite is attached to this email. Click it to add the event to your calendar.</p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Need to reschedule? Reply to this email.
        </p>
      </div>
    `,
      icalEvent: {
        method: "REQUEST",
        content: calendar.toString(),
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ORGANIZER_EMAIL,
      subject: `New Booking: ${name}`,
      html: `
      <h2>New Interview Scheduled</h2>
      <p><strong>Guest:</strong> ${name} (${email})</p>
      <p><strong>Date:</strong> ${startDate.toLocaleString()}</p>
      <p><strong>Duration:</strong> ${duration} minutes</p>
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
