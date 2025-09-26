'use client';

import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Appointment type definition
interface Appointment {
  id: number;
  patientName: string;
  time: string;
  event: string;
  date: string;
}

// Dummy appointment data
const appointmentsData: Appointment[] = [
  {
    id: 1,
    patientName: 'John Smith',
    time: '09:00',
    event: 'Regular Checkup',
    date: '2025-09-24'
  },
  {
    id: 2,
    patientName: 'Sarah Johnson',
    time: '10:30',
    event: 'Blood Test Review',
    date: '2025-09-24'
  },
  {
    id: 3,
    patientName: 'Mike Brown',
    time: '14:00',
    event: 'Follow-up Consultation',
    date: '2025-09-25'
  }
];

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // September 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isHoliday = (date: Date) => {
    // Mark Sundays as holidays
    return date.getDay() === 0;
  };

  const hasAppointments = (dateStr: string) => {
    return appointmentsData.some(apt => apt.date === dateStr);
  };

  const getAppointmentsForDate = (dateStr: string) => {
    return appointmentsData.filter(apt => apt.date === dateStr);
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isHolidayDay = isHoliday(date);
      const hasApts = hasAppointments(dateStr);
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === '2025-09-24'; // Highlight today

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-12 flex items-center justify-center cursor-pointer rounded-lg transition-colors relative ${
            isSelected
              ? 'bg-blue-500 text-white'
              : isToday
              ? 'bg-blue-100 text-blue-600'
              : isHolidayDay
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'hover:bg-gray-100'
          }`}
        >
          <span className="text-sm font-medium">{day}</span>
          {hasApts && (
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];
  const totalAppointments = appointmentsData.length;
  const thisMonthAppointments = appointmentsData.filter(apt => 
    apt.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Calendar Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-gray-800">Calendar</h1>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span>Holidays</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Appointments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Month Navigation */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaChevronLeft />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="h-10 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-500">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendarDays()}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Date Selection Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a date</h3>
              <p className="text-gray-600 mb-4">Click on a date to view appointments</p>
              
              {selectedDate && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Selected: {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h4>
                  
                  {selectedAppointments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedAppointments.map(apt => (
                        <div key={apt.id} className="bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium text-blue-900">{apt.patientName}</div>
                          <div className="text-sm text-blue-700">{apt.event}</div>
                          <div className="text-sm text-blue-600">{apt.time}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No appointments scheduled</p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Appointments</span>
                  <span className="font-semibold text-gray-800">{totalAppointments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-gray-800">{thisMonthAppointments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Holidays</span>
                  <span className="font-semibold text-red-600">4</span>
                </div>
              </div>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today&apos;s Appointments</h3>
              
              {getAppointmentsForDate('2025-09-24').length > 0 ? (
                <div className="space-y-2">
                  {getAppointmentsForDate('2025-09-24').map(apt => (
                    <div key={apt.id} className="bg-green-50 p-3 rounded-lg">
                      <div className="font-medium text-green-900">{apt.patientName}</div>
                      <div className="text-sm text-green-700">{apt.event}</div>
                      <div className="text-sm text-green-600">{apt.time}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No appointments today</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
