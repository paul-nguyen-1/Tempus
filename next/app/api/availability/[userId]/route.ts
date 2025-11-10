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

    allAvailability.forEach((av) => {
      if (av.type === "RECURRING" && av.dayOfWeek !== null) {
        if (!weeklyAvailability[av.dayOfWeek].available) {
          weeklyAvailability[av.dayOfWeek] = { available: true, slots: [] };
        }
        weeklyAvailability[av.dayOfWeek].slots.push({
          start: av.startTime,
          end: av.endTime,
        });
      } else if (av.type === "DATE_RANGE" && av.startDate && av.endDate) {
        dateRanges.push({
          start: new Date(av.startDate),
          end: new Date(av.endDate),
        });
      } else if (av.type === "SPECIFIC_DATE" && av.startDate) {
        specificDates.push(new Date(av.startDate));
      }
    });

    return NextResponse.json({
      weekly: weeklyAvailability,
      specificDates: specificDates.map((d) => d.toISOString()),
      dateRanges: dateRanges.map((r) => ({
        start: r.start.toISOString(),
        end: r.end.toISOString(),
      })),
      all: allAvailability.map((av) => ({
        id: av.id,
        type: av.type,
        dayOfWeek: av.dayOfWeek,
        startDate: av.startDate,
        endDate: av.endDate,
        startTime: av.startTime,
        endTime: av.endTime,
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
