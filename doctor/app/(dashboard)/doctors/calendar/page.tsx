"use client";
import React, { useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  RefreshCw,
} from "lucide-react";
import { api } from "@/utils/react";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState(undefined);
  const {data:hashospital, isLoading: isLoadingHospital} = api.user.getIfIHaveHospital.useQuery();
  useEffect(() => {
    if (hashospital && !hashospital.hasHospital) {
        alert('You are not associated with any hospital. Please contact your hospital administrator.');
        // Optionally, redirect to another page
        window.location.href = '/doctors/my-hospital';
    }
  }, [hashospital]);

  // Get start and end of month
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const { data, isLoading, refetch } = api.user.getCalendarData.useQuery({
    startDate: startOfMonth,
    endDate: endOfMonth,
    doctorId: selectedDoctorId,
  });

  const daysInMonth = endOfMonth.getDate();
  const firstDayOfMonth = startOfMonth.getDay();

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getMonthYear = () => {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatDateKey = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return date.toISOString().split("T")[0];
  };

  const getAppointmentsForDay = (day: number) => {
    const dateKey = formatDateKey(day);
    return data?.appointmentsByDate?.[dateKey] || [];
  };

  const getStatusColor = (
    status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED"
  ) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-blue-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Appointment Calendar
              </h1>
              <p className="text-gray-600">View and manage your appointments</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Calendar Controls */}
          <div className="bg-white flex-1 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {getMonthYear()}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Calendar Days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const appointments = getAppointmentsForDay(day);
                const today = isToday(day);

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-2 hover:bg-gray-50 transition-colors ${
                      today ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold mb-1 ${today ? "text-blue-600" : "text-gray-900"}`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {appointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className={`text-xs px-2 py-1 rounded text-white truncate ${getStatusColor(apt?.status as any)}`}
                          title={`${apt.patient?.user?.name || apt.doctor?.user?.name} - ${apt.status}`}
                        >
                          {new Date(apt.appointmentDate).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </div>
                      ))}
                      {appointments.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{appointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend and Stats */}
          <div className="flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Legend */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Status Legend</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm text-gray-700">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    <span className="text-sm text-gray-700">Pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span className="text-sm text-gray-700">Completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-sm text-gray-700">Cancelled</span>
                  </div>
                </div>
              </div>

              {/* Monthly Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Monthly Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Total Appointments
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {data?.appointments?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Confirmed
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {data?.appointments?.filter(
                        (a) => a.status === "CONFIRMED"
                      ).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Pending
                    </span>
                    <span className="text-lg font-bold text-yellow-600">
                      {data?.appointments?.filter((a) => a.status === "PENDING")
                        .length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Completed
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {data?.appointments?.filter(
                        (a) => a.status === "COMPLETED"
                      ).length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Upcoming Appointments
              </h3>
              <div className="space-y-3">
                {data?.appointments
                  ?.filter((apt) => new Date(apt.appointmentDate) >= new Date())
                  .slice(0, 5)
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            apt.patient?.user?.image ||
                            apt.doctor?.user?.image ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.patient?.user?.name || apt.doctor?.user?.name}`
                          }
                          alt={
                            apt.patient?.user?.name || apt.doctor?.user?.name
                          }
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {apt.patient?.user?.name || apt.doctor?.user?.name}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(apt.appointmentDate).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(apt?.status as any)}`}
                      >
                        {apt.status}
                      </div>
                    </div>
                  ))}
                {(!data?.appointments || data.appointments.length === 0) && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No upcoming appointments</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
