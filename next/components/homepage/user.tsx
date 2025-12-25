"use client";

import { useSession } from "@/lib/auth-client";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Link2,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function UserHome() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalClients: 0,
    hoursBooked: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      try {
        const bookingsRes = await fetch(`/api/booking/${session.user.id}`);
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData);

          const now = new Date();
          const upcoming = bookingsData.filter(
            (b: any) => new Date(b.startTime) > now
          ).length;
          const uniqueClients = new Set(bookingsData.map((b: any) => b.email))
            .size;
          const totalHours = bookingsData.reduce((acc: number, b: any) => {
            const duration =
              (new Date(b.endTime).getTime() -
                new Date(b.startTime).getTime()) /
              (1000 * 60 * 60);
            return acc + duration;
          }, 0);

          setStats({
            totalBookings: bookingsData.length,
            upcomingBookings: upcoming,
            totalClients: uniqueClients,
            hoursBooked: Math.round(totalHours),
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [session?.user?.id]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Overview</h1>
            <p className="text-lg text-muted-foreground">
              Track your bookings, clients, and availability
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Calendar className="h-6 w-6" />}
              label="Total Bookings"
              value={stats.totalBookings.toString()}
              subtitle="All time"
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Upcoming"
              value={stats.upcomingBookings.toString()}
              subtitle="Scheduled"
              color="green"
            />
            <StatCard
              icon={<Users className="h-6 w-6" />}
              label="Total Clients"
              value={stats.totalClients.toString()}
              subtitle="Unique"
              color="purple"
            />
            <StatCard
              icon={<Clock className="h-6 w-6" />}
              label="Hours Booked"
              value={stats.hoursBooked.toString()}
              subtitle="Total time"
              color="orange"
            />
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Your Booking Link</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-md border bg-muted px-4 py-3 text-sm font-mono">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/profile/book/${session?.user?.id}`
                  : `tempus.app/profile/book/${session?.user?.id}`}
              </div>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/profile/book/${session?.user?.id}`
                    );
                  }
                }}
                className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Copy Link
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this link with anyone who wants to book time with you
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Bookings</h2>
              <Link
                href="/bookings"
                className="text-sm text-primary hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="rounded-lg border bg-card">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No bookings yet</p>
                  <p className="text-sm mb-4">
                    Share your booking link to get started
                  </p>
                  <Link
                    href={`/profile/book/${session?.user?.id}`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    View your booking page →
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {bookings.slice(0, 5).map((booking: any) => (
                    <BookingRow key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <ActionCard
                href="/analytics"
                title="View Analytics"
                description="Detailed analytics and insights"
                icon={<LayoutDashboard className="h-5 w-5" />}
              />
              <ActionCard
                href={`/profile/book/${session?.user?.id}`}
                title="View Booking Page"
                description="See what clients see when booking"
                icon={<Link2 className="h-5 w-5" />}
              />
              <ActionCard
                href="/profile/availability"
                title="Update Availability"
                description="Manage your schedule and time slots"
                icon={<Calendar className="h-5 w-5" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-green-500/10 text-green-600",
    purple: "bg-purple-500/10 text-purple-600",
    orange: "bg-orange-500/10 text-orange-600",
  };

  return (
    <div className="rounded-lg border bg-card p-6 space-y-3">
      <div className={`w-fit p-2 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function BookingRow({ booking }: { booking: any }) {
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const isPast = startTime < new Date();

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="font-medium">{booking.name}</p>
          <p className="text-sm text-muted-foreground">{booking.email}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm font-medium">
            {startTime.toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground">
            {startTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {endTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <div className="mt-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            isPast ? "bg-gray-100 text-gray-700" : "bg-green-100 text-green-700"
          }`}
        >
          {isPast ? "Completed" : "Upcoming"}
        </span>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border bg-card p-4 hover:shadow-md transition-all hover:border-primary/50"
    >
      <div className="flex items-start gap-3">
        <div className="text-primary">{icon}</div>
        <div className="space-y-1">
          <h3 className="font-medium group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}
