"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/utils/react";
import { Calendar, Users, FileText, Clock, Activity, TrendingUp } from "lucide-react";

export default function DoctorDashboard() {
  const { data, isLoading } = api.user.getDashboardData.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">No data available</p>
          <p className="text-sm text-slate-500 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Doctor Dashboard
          </h1>
          <p className="text-slate-600 text-lg">Welcome back! Here{'\''}s your practice overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase opacity-90">Total Appointments</CardTitle>
              <Calendar className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalAppointments}</div>
              <p className="text-xs opacity-90 mt-2 font-medium">
                {data.pendingAppointments} pending confirmation
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase opacity-90">Today{'\''}s Schedule</CardTitle>
              <Clock className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.todayAppointments}</div>
              <p className="text-xs opacity-90 mt-2 font-medium">
                Appointments today
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase opacity-90">Total Patients</CardTitle>
              <Users className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalPatients}</div>
              <p className="text-xs opacity-90 mt-2 font-medium">
                Unique patients treated
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase opacity-90">Consultations</CardTitle>
              <FileText className="h-5 w-5 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalConsultations}</div>
              <p className="text-xs opacity-90 mt-2 font-medium">
                Total records created
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Status */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl font-bold text-slate-800">Appointment Status Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 border border-amber-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-amber-700">{data.pendingAppointments}</p>
                    <p className="text-sm font-semibold text-amber-600 mt-1 uppercase tracking-wide">Pending</p>
                  </div>
                  <Clock className="h-10 w-10 text-amber-400 opacity-50" />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{data.confirmedAppointments}</p>
                    <p className="text-sm font-semibold text-blue-600 mt-1 uppercase tracking-wide">Confirmed</p>
                  </div>
                  <Calendar className="h-10 w-10 text-blue-400 opacity-50" />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border border-emerald-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-emerald-700">{data.completedAppointments}</p>
                    <p className="text-sm font-semibold text-emerald-600 mt-1 uppercase tracking-wide">Completed</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-emerald-400 opacity-50" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl font-bold text-slate-800">Upcoming Appointments</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {data.upcomingAppointments && data.upcomingAppointments.length > 0 ? (
                data.upcomingAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-slate-800 text-lg">{appointment.patientName}</p>
                      <p className="text-sm text-slate-600 font-medium">{appointment.patientEmail}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                          {appointment.hospitalName}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium mt-2">
                        {new Date(appointment.appointmentDate).toLocaleString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className="text-sm px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                      {appointment.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No upcoming appointments</p>
                  <p className="text-sm text-slate-400 mt-1">Your schedule is clear</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Consultations */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl font-bold text-slate-800">Recent Consultations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {data.recentConsultations && data.recentConsultations.length > 0 ? (
                data.recentConsultations.map((consultation: any) => (
                  <div key={consultation.id} className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <p className="font-bold text-slate-800 text-lg">{consultation.patientName}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{consultation.remarks}</p>
                        {consultation.nextVisitDate && (
                          <div className="inline-flex items-center gap-2 mt-3 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                            <Calendar className="h-3 w-3" />
                            Next Visit: {new Date(consultation.nextVisitDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
                        {new Date(consultation.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No recent consultations</p>
                  <p className="text-sm text-slate-400 mt-1">Consultation records will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}