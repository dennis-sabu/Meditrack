'use client';
import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  MapPin,
  User,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { api } from "@/utils/react";

const AppointmentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [searchHospital, setSearchHospital] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch user's appointments
  const {
    data: appointments,
    isLoading: loadingAppointments,
    refetch,
  } = api.user.getMyAppointments.useQuery();

  // Fetch hospitals list
  const { data: hospitals, isLoading: loadingHospitals } =
    api.user.getListOfHospitals.useQuery();

  // Fetch hospital details with doctors when hospital is selected
  const { data: hospitalDetails } = api.user.getHospitalById.useQuery(
    { id: selectedHospital?.id || 0 },
    { enabled: !!selectedHospital }
  );

  // Send appointment request mutation
  const sendAppointment = api.user.sendAppointmentRequest.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setSelectedHospital(null);
    setSelectedDoctor(null);
    setAppointmentDate("");
    setAppointmentTime("");
  };

  const handleSubmitAppointment = () => {
    if (
      !selectedHospital ||
      !selectedDoctor ||
      !appointmentDate ||
      !appointmentTime
    ) {
      alert("Please fill all fields");
      return;
    }

    const dateTimeString = `${appointmentDate}T${appointmentTime}:00`;

    sendAppointment.mutate({
      hospitalId: selectedHospital.id,
      doctorId: selectedDoctor.id,
      appointmentDate: dateTimeString,
    });
  };

  const getStatusColor = (status : "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED") => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status : "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED") => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-4 h-4" />;
      case "PENDING":
        return <AlertCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDateTime = (date : string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredHospitals = hospitals?.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchHospital.toLowerCase()) ||
      hospital.address?.toLowerCase().includes(searchHospital.toLowerCase())
  );

  const filteredAppointments = appointments?.filter(
    (apt) => filterStatus === "all" || apt.status === filterStatus
  );

  if (loadingAppointments) {
    return (
      <div className="min-h-screen w-full flex-1 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Appointments
              </h1>
              <p className="text-gray-600">
                Manage and track your medical appointments
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900">
                  {appointments?.length || 0}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {appointments?.filter((a) => a.status === "PENDING").length ||
                    0}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">
                  {appointments?.filter((a) => a.status === "CONFIRMED")
                    .length || 0}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-blue-600">
                  {appointments?.filter((a) => a.status === "COMPLETED")
                    .length || 0}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Appointments</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments && filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        appointment.doctor?.user?.image ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.doctor?.user?.name}`
                      }
                      alt={appointment.doctor?.user?.name}
                      className="w-16 h-16 rounded-full border-2 border-blue-500"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Dr. {appointment.doctor?.user?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.doctor?.specialization ||
                          "General Physician"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {appointment.hospital?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(appointment.status as "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED")}`}
                  >
                    {getStatusIcon(appointment?.status as "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED")}
                    <span className="text-xs font-medium">
                      {appointment.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(appointment.appointmentDate.toDateString() ?? '')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {appointment.hospital?.address || "Address not available"}
                    </span>
                  </div>
                  {appointment.otp && appointment.status === "CONFIRMED" && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-700">OTP:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 font-mono font-bold rounded">
                        {appointment.otp}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Appointments Found
            </h3>
            <p className="text-gray-600 mb-6">
              Start by booking your first appointment
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Book Appointment
            </button>
          </div>
        )}

        {/* Create Appointment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg flex items-center justify-between">
                <h2 className="text-2xl font-bold">Book New Appointment</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Step 1: Select Hospital */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Step 1: Select Hospital
                  </h3>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search hospitals..."
                        value={searchHospital}
                        onChange={(e) => setSearchHospital(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {loadingHospitals ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                      {filteredHospitals?.map((hospital) => (
                        <div
                          key={hospital.id}
                          onClick={() => setSelectedHospital(hospital)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedHospital?.id === hospital.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Building2 className="w-8 h-8 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {hospital.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {hospital.address}
                              </p>
                              {hospital.isVerified && (
                                <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  <CheckCircle className="w-3 h-3" />
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2: Select Doctor */}
                {selectedHospital && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Step 2: Select Doctor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                      {hospitalDetails?.doctors?.map((doctor) => (
                        <div
                          key={doctor.id}
                          onClick={() => setSelectedDoctor(doctor)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedDoctor?.id === doctor.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={
                                doctor.user.image ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.user.name}`
                              }
                              alt={doctor.user.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                Dr. {doctor.user.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {doctor.specialization}
                              </p>
                              {doctor.experienceYears && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {doctor.experienceYears} years experience
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Select Date & Time */}
                {selectedDoctor && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Step 3: Select Date & Time
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time
                        </label>
                        <input
                          type="time"
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-lg border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAppointment}
                  disabled={
                    !selectedHospital ||
                    !selectedDoctor ||
                    !appointmentDate ||
                    !appointmentTime ||
                    sendAppointment.isPending
                  }
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendAppointment.isPending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Book Appointment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
