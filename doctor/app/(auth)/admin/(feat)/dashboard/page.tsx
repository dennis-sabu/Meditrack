"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/utils/react";
import { Users, Building2, UserCheck, Calendar, DollarSign, Stethoscope } from "lucide-react";

export default function AdminDashboard() {
  const { data, isLoading } = api.user.getDashboardData.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hospitals</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalHospitals}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.verifiedHospitals} verified, {data.pendingHospitals} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDoctors}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.verifiedDoctors} verified, {data.pendingDoctors} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPatients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAppointments}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.pendingAppointments} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalConsultations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.totalRevenue?.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointment Status</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-xs">Confirmed: {data.confirmedAppointments}</p>
              <p className="text-xs">Completed: {data.completedAppointments}</p>
              <p className="text-xs">Cancelled: {data.cancelledAppointments}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Data Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Hospitals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Hospitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentHospitals?.map((hospital: any) => (
                <div key={hospital.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{hospital.name}</p>
                    <p className="text-sm text-gray-500">{hospital.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      hospital.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {hospital.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Doctors */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentDoctors?.map((doctor: any) => (
                <div key={doctor.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{doctor.name}</p>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      doctor.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doctor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentAppointments?.map((appointment: any) => (
              <div key={appointment.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex-1">
                  <p className="font-medium">{appointment.patientName}</p>
                  <p className="text-sm text-gray-500">
                    Dr. {appointment.doctorName} • {appointment.hospitalName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded ${
                  appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentPayments?.map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">${payment.amount}</p>
                  <p className="text-sm text-gray-500">
                    {payment.type} • {payment.method}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    payment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}