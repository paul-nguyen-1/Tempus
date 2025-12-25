import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Date required" }, { status: 400 });
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const startOfDay = new Date(parsed);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(parsed);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId,
        startTime: { gte: startOfDay, lte: endOfDay },
        status: "CONFIRMED",
      },
      select: { startTime: true, endTime: true },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Error fetching bookings route:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
