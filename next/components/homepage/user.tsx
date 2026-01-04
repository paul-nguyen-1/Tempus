"use client";

import { useSession } from "@/lib/auth-client";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Link2,
  LayoutDashboard,
  Copy,
  ArrowRight,
  CheckCircle2,
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
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        `${window.location.origin}/profile/book/${session?.user?.id}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const bookingLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile/book/${session?.user?.id}`
      : `${process.env.BETTER_AUTH_URL}/profile/book/${session?.user?.id}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome back, {session?.user?.name || "there"}
          </h1>
          <p className="text-base text-gray-600">
            Here's what's happening with your bookings today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            label="Total Bookings"
            value={stats.totalBookings.toString()}
            change="+12.5%"
            isPositive={true}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Upcoming"
            value={stats.upcomingBookings.toString()}
            subtitle="Scheduled"
            color="green"
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total Clients"
            value={stats.totalClients.toString()}
            subtitle="Unique visitors"
            color="purple"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Hours Booked"
            value={stats.hoursBooked.toString()}
            subtitle="All time"
            color="orange"
          />
        </div>

        <div className="bg-white rounded-xl border p-8 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Booking Link
                </h2>
              </div>
              <p className="text-sm text-gray-600">
                Share this link with anyone who wants to book time with you
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm font-mono text-gray-700 truncate">
                {bookingLink}
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Bookings
              </h2>
              <Link
                href="/bookings"
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {bookings.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Share your booking link to get started
                  </p>
                  <Link
                    href={`/profile/book/${session?.user?.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View your booking page
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {bookings.slice(0, 5).map((booking: any) => (
                    <BookingRow key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <ActionCard
                href="/profile/analytics"
                title="Analytics"
                description="View detailed insights"
                icon={<LayoutDashboard className="h-5 w-5" />}
                color="blue"
              />
              <ActionCard
                href={`/profile/book/${session?.user?.id}`}
                title="Booking Page"
                description="Preview your page"
                icon={<Link2 className="h-5 w-5" />}
                color="green"
              />
              <ActionCard
                href="/profile/availability"
                title="Availability"
                description="Update your schedule"
                icon={<Calendar className="h-5 w-5" />}
                color="purple"
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
  change,
  isPositive,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {(subtitle || change) && (
          <p
            className={`text-xs ${
              change
                ? isPositive
                  ? "text-green-600"
                  : "text-red-600"
                : "text-gray-500"
            }`}
          >
            {change || subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function BookingRow({ booking }: { booking: any }) {
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const isPast = startTime < new Date();

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
            {booking.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{booking.name}</p>
            <p className="text-sm text-gray-600 truncate">{booking.email}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-medium text-gray-900">
            {startTime.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-600">
            {startTime.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
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
  color,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    green: "bg-green-50 text-green-600 group-hover:bg-green-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
  };

  return (
    <Link
      href={href}
      className="group block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg transition-colors ${colorClasses[color]}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 mb-0.5">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  );
}
