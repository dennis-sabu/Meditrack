'use client'
import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Video, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '@/utils/react';

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data, isLoading, refetch } = api.user.getScheduleData.useQuery({
    date: selectedDate,
  });

  const getStatusColor = (status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <AlertCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Today{'\''}s Schedule</h1>
              <p className="text-gray-600">{formatDate(selectedDate)}</p>
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

        {/* Date Selector */}
        <div className="mb-6">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Stats Cards */}
        {data?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{data.stats.total}</p>
                </div>
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{data.stats.pending}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">{data.stats.confirmed}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{data.stats.completed}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Appointments</h2>
            {data?.appointments && data.appointments.length > 0 ? (
              data.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={appointment.patient.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.patient.user.name}`}
                        alt={appointment.patient.user.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.patient.user.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(appointment.appointmentDate)}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(appointment?.status as 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' ?? 'PENDING')}`}>
                      {getStatusIcon(appointment?.status as 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED')}
                      <span className="text-xs font-medium">{appointment.status}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {appointment.patient.user.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {appointment.patient.user.phone}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No appointments scheduled for this date</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Doctor Info */}
            {data?.doctor && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Doctor Profile</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={data.doctor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.doctor.name}`}
                    alt={data.doctor.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{data.doctor.name}</h4>
                    <p className="text-sm text-gray-600">{data.doctor.specialization}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Availability */}
            {data?.availability && data.availability.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Today{'\''}s Availability</h3>
                <div className="space-y-3">
                  {data.availability.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{slot.dayOfWeek}</span>
                      <span className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Requests */}
            {data?.videoRequests && data.videoRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  Video Consultation Requests
                </h3>
                <div className="space-y-3">
                  {data.videoRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={request.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.user.name}`}
                          alt={request.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{request.user.name}</p>
                          <p className="text-xs text-gray-600">{request.user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                          Accept
                        </button>
                        <button className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;