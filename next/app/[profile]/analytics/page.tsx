"use client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data
const bookingsOverTime = [
  { date: "Jan 1", bookings: 12 },
  { date: "Jan 2", bookings: 19 },
  { date: "Jan 3", bookings: 15 },
  { date: "Jan 4", bookings: 25 },
  { date: "Jan 5", bookings: 22 },
  { date: "Jan 6", bookings: 30 },
  { date: "Jan 7", bookings: 28 },
];

const bookingsByDay = [
  { day: "Mon", bookings: 45 },
  { day: "Tue", bookings: 52 },
  { day: "Wed", bookings: 38 },
  { day: "Thu", bookings: 61 },
  { day: "Fri", bookings: 48 },
  { day: "Sat", bookings: 23 },
  { day: "Sun", bookings: 15 },
];

const bookingsByTimeSlot = [
  { time: "9-11 AM", bookings: 42 },
  { time: "11-1 PM", bookings: 56 },
  { time: "1-3 PM", bookings: 48 },
  { time: "3-5 PM", bookings: 65 },
  { time: "5-7 PM", bookings: 38 },
];

const bookingStatus = [
  { name: "Confirmed", value: 182, color: "#10b981" },
  { name: "Pending", value: 45, color: "#f59e0b" },
  { name: "Cancelled", value: 23, color: "#ef4444" },
];

const recentBookings = [
  {
    id: 1,
    name: "Sarah Johnson",
    time: "Today, 2:00 PM - 3:00 PM",
    status: "confirmed",
  },
  {
    id: 2,
    name: "Michael Chen",
    time: "Today, 4:30 PM - 5:30 PM",
    status: "confirmed",
  },
  {
    id: 3,
    name: "Emma Wilson",
    time: "Tomorrow, 10:00 AM - 11:00 AM",
    status: "pending",
  },
  {
    id: 4,
    name: "James Martinez",
    time: "Tomorrow, 2:00 PM - 3:30 PM",
    status: "confirmed",
  },
  {
    id: 5,
    name: "Olivia Brown",
    time: "Jan 5, 1:00 PM - 2:00 PM",
    status: "cancelled",
  },
];

export default function Analytics() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track your booking performance and insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Bookings
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">250</p>
              <p className="mt-1 text-sm text-green-600">
                +12.5% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">387</p>
              <p className="mt-1 text-sm text-green-600">
                +8.2% from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Conversion Rate
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">82%</p>
              <p className="mt-1 text-sm text-green-600">
                +3.1% from last month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">1.5h</p>
              <p className="mt-1 text-sm text-gray-500">
                Stable from last month
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bookings Over Time
            </h2>
            <p className="mt-1 text-sm text-gray-500">Last 7 days</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bookings by Day
            </h2>
            <p className="mt-1 text-sm text-gray-500">This week</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="bookings" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Popular Time Slots
            </h2>
            <p className="mt-1 text-sm text-gray-500">Most booked times</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingsByTimeSlot} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  type="category"
                  dataKey="time"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="bookings" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Booking Status
            </h2>
            <p className="mt-1 text-sm text-gray-500">Current distribution</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bookingStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {bookingStatus.map((status, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {status.name}
                      </p>
                      <p className="text-sm text-gray-600">{status.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Bookings
          </h2>
          <p className="mt-1 text-sm text-gray-500">Latest booking activity</p>
        </div>
        <div className="divide-y divide-gray-200">
          {recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {booking.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{booking.name}</p>
                  <p className="text-sm text-gray-600">{booking.time}</p>
                </div>
              </div>
              <div>
                {booking.status === "confirmed" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Confirmed
                  </span>
                )}
                {booking.status === "pending" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                )}
                {booking.status === "cancelled" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Cancelled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
