import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const allAvailability = await prisma.availability.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const weeklyAvailability: Record<
      number,
      { available: boolean; slots: { start: string; end: string }[] }
    > = {
      0: { available: false, slots: [] },
      1: { available: false, slots: [] },
      2: { available: false, slots: [] },
      3: { available: false, slots: [] },
      4: { available: false, slots: [] },
      5: { available: false, slots: [] },
      6: { available: false, slots: [] },
    };

    const specificDates: Date[] = [];
    const dateRanges: { start: Date; end: Date }[] = [];

    allAvailability.forEach((availability) => {
      if (
        availability.type === "RECURRING" &&
        availability.dayOfWeek !== null
      ) {
        if (!weeklyAvailability[availability.dayOfWeek].available) {
          weeklyAvailability[availability.dayOfWeek] = {
            available: true,
            slots: [],
          };
        }
        weeklyAvailability[availability.dayOfWeek].slots.push({
          start: availability.startTime,
          end: availability.endTime,
        });
      } else if (
        availability.type === "DATE_RANGE" &&
        availability.startDate &&
        availability.endDate
      ) {
        dateRanges.push({
          start: new Date(availability.startDate),
          end: new Date(availability.endDate),
        });
      } else if (
        availability.type === "SPECIFIC_DATE" &&
        availability.startDate
      ) {
        specificDates.push(new Date(availability.startDate));
      }
    });

    return NextResponse.json({
      weekly: weeklyAvailability,
      specificDates: specificDates.map((date) => date.toISOString()),
      dateRanges: dateRanges.map((range) => ({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      })),
      all: allAvailability.map((availability) => ({
        id: availability.id,
        type: availability.type,
        dayOfWeek: availability.dayOfWeek,
        startDate: availability.startDate,
        endDate: availability.endDate,
        startTime: availability.startTime,
        endTime: availability.endTime,
      })),
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
