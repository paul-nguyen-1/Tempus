export type TimeSlot = {
  start: string;
  end: string;
};

export type DayAvailability = {
  available: boolean;
  slots: TimeSlot[];
};

export type WeeklyAvailability = {
  [key: number]: DayAvailability;
};

export type Booking = {
  startTime: string;
  endTime: string;
};

export type AvailabilityType = "RECURRING" | "DATE_RANGE" | "SPECIFIC_DATE";

export type AvailabilityEntry = {
  id: string;
  type: AvailabilityType;
  dayOfWeek: number | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string;
  endTime: string;
};

export type IntervalType = 15 | 30 | 60;
