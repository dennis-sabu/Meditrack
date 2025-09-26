'use client'
import React, { useState } from 'react';
import { 
  Calendar, Clock, Search, User, Phone, Mail, MapPin, 
  ChevronLeft, ChevronRight, X, Check, Ban, FileText, 
  Activity, AlertCircle, Download, Eye, ChevronDown, 
  Plus, Pill, Heart, AlertTriangle, Loader2
} from 'lucide-react';
import { api } from '@/utils/react';
import jsPDF from 'jspdf';

// Import your tRPC hooks
// import { api } from '~/utils/api';

export default function DoctorAppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultationData, setConsultationData] = useState({
    remarks: '',
    prescriptionDetails: '',
    nextVisitDate: ''
  });
  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentActionAppointment, setCurrentActionAppointment] = useState<null | { id: number; action: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' }>(null);

  // Fetch appointments using tRPC
  const { data, isLoading, refetch } = api.user.getAppointments.useQuery({
    page: currentPage,
    pageSize: 10,
    status: statusFilter !== 'ALL' ? statusFilter as 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' : undefined,
    searchQuery: searchQuery || undefined,
    dateFrom: dateFilter ? new Date(dateFilter) : undefined,
  });

  // Update appointment status mutation
  const updateStatusMutation = api.user.updateAppointmentStatus.useMutation({
    onSuccess: () => {
      refetch();
      setShowOtpModal(false);
      setOtpInput('');
      alert('Appointment status updated successfully!');
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    }
  });

  // Verify OTP mutation
  const verifyOtpMutation = api.user.verifyAppointmentOTP.useMutation({
    onSuccess: () => {
      if (currentActionAppointment) {
        updateStatusMutation.mutate({
          appointmentId: currentActionAppointment?.id ?? 0,
          status: currentActionAppointment?.action ?? 'PENDING'
        });
      }
    },
    onError: (error) => {
      alert(`Invalid OTP: ${error.message}`);
    }
  });

  // Create consultation mutation
  const createConsultationMutation = api.user.createConsultation.useMutation({
    onSuccess: () => {
      refetch();
      setShowConsultationModal(false);
      setConsultationData({ remarks: '', prescriptionDetails: '', nextVisitDate: '' });
      alert('Consultation completed successfully!');
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    }
  });

  // Get appointment details
  const { data: appointmentDetails } = api.user.getAppointmentDetails.useQuery(
    { appointmentId: selectedAppointment?.id  ?? 0},
    { enabled: !!selectedAppointment }
  );

  const getStatusColor = (status: string | null | undefined) => {
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateAge = (dob: string | Date) => {
    const diff = Date.now() - new Date(dob).getTime();
    const age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  const maskPhone = (phone: string | null) => {
    if (!phone) return null;
    if (phone.length <= 4) return phone;
    return phone.substring(0, 2) + '*'.repeat(phone.length - 4) + phone.substring(phone.length - 2);
  };

  const exportToPDF = (appointment: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Appointment Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Patient Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${appointment.patient.user.name}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Age: ${calculateAge(appointment.patient.dob)} years`, 20, yPosition);
    yPosition += 8;
    doc.text(`Gender: ${appointment.patient.gender}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Email: ${maskEmail(appointment.patient.user.email)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Phone: ${maskPhone(appointment.patient.user.phone)}`, 20, yPosition);
    yPosition += 8;
    if (appointment.patient.user.address) {
      doc.text(`Address: ${appointment.patient.user.address}`, 20, yPosition);
      yPosition += 8;
    }
    yPosition += 10;

    // Medical History
    if (appointment.patient.allergies || appointment.patient.medicalHistory) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical History & Allergies', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      if (appointment.patient.allergies) {
        doc.text(`Allergies: ${appointment.patient.allergies}`, 20, yPosition);
        yPosition += 8;
      }
      if (appointment.patient.medicalHistory) {
        const historyLines = doc.splitTextToSize(`Medical History: ${appointment.patient.medicalHistory}`, pageWidth - 40);
        doc.text(historyLines, 20, yPosition);
        yPosition += historyLines.length * 6;
      }
      yPosition += 10;
    }

    // Appointment Details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Appointment Details', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${formatDate(appointment.appointmentDate)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Time: ${formatTime(appointment.appointmentDate)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Status: ${appointment.status}`, 20, yPosition);
    yPosition += 8;
    yPosition += 10;

    // Hospital Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Hospital Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Hospital: ${appointment.hospital.name}`, 20, yPosition);
    yPosition += 8;
    const addressLines = doc.splitTextToSize(`Address: ${appointment.hospital.address}`, pageWidth - 40);
    doc.text(addressLines, 20, yPosition);
    yPosition += addressLines.length * 6;
    doc.text(`Contact: ${appointment.hospital.contactNumber}`, 20, yPosition);
    yPosition += 15;

    // Previous Consultations
    if (appointmentDetails?.previousConsultations && appointmentDetails.previousConsultations.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Previous Consultations', 20, yPosition);
      yPosition += 10;

      appointmentDetails.previousConsultations.forEach((consultation, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Consultation ${index + 1}`, 20, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${formatDate(consultation.createdAt?.toString() || '')}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Doctor: Dr. ${consultation.doctor.user.name}`, 20, yPosition);
        yPosition += 6;

        if (consultation.remarks) {
          const remarksLines = doc.splitTextToSize(`Remarks: ${consultation.remarks}`, pageWidth - 40);
          doc.text(remarksLines, 20, yPosition);
          yPosition += remarksLines.length * 6;
        }

        if (consultation.prescriptionDetails) {
          const prescriptionLines = doc.splitTextToSize(`Prescription: ${consultation.prescriptionDetails}`, pageWidth - 40);
          doc.text(prescriptionLines, 20, yPosition);
          yPosition += prescriptionLines.length * 6;
        }
        yPosition += 8;
      });
    }

    // Health Metrics
    if (appointmentDetails?.healthMetrics && appointmentDetails.healthMetrics.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Recent Health Metrics', 20, yPosition);
      yPosition += 10;

      appointmentDetails.healthMetrics.forEach((metric, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Record ${index + 1}`, 20, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${formatDate(metric.recordedAt?.toString() || '')}`, 20, yPosition);
        yPosition += 6;

        if (metric.reportType) {
          doc.text(`Type: ${metric.reportType}`, 20, yPosition);
          yPosition += 6;
        }

        const metrics = [];
        if (metric.sugarLevel) metrics.push(`Sugar Level: ${metric.sugarLevel} mg/dL`);
        if (metric.bloodPressure) metrics.push(`Blood Pressure: ${metric.bloodPressure}`);
        if (metric.cholesterol) metrics.push(`Cholesterol: ${metric.cholesterol} mg/dL`);

        metrics.forEach(metricText => {
          doc.text(metricText, 20, yPosition);
          yPosition += 6;
        });

        if (metric.notes) {
          const notesLines = doc.splitTextToSize(`Notes: ${metric.notes}`, pageWidth - 40);
          doc.text(notesLines, 20, yPosition);
          yPosition += notesLines.length * 6;
        }
        yPosition += 8;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(`${appointment.patient.user.name.replace(/\s+/g, '_')}_appointment_${appointment.id}.pdf`);
  };

  const handleStatusUpdate = (appointmentId: number, status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
    const appointment = data?.appointments.find(a => a.id === appointmentId);
    if (status === 'CONFIRMED' || status === 'COMPLETED') {
      setCurrentActionAppointment({ id: appointmentId, action: status });
      setShowOtpModal(true);
    } else {
      updateStatusMutation.mutate({ appointmentId, status });
    }
  };

  const handleVerifyOtp = () => {
    if (currentActionAppointment && otpInput.length === 6) {
      verifyOtpMutation.mutate({
        appointmentId: currentActionAppointment.id,
        otp: otpInput
      });
    }
  };

  const handleStartConsultation = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowConsultationModal(true);
  };

  const handleCreateConsultation = () => {
    if (selectedAppointment) {
      createConsultationMutation.mutate({
        appointmentId: selectedAppointment?.id ?? 0,
        remarks: consultationData.remarks,
        prescriptionDetails: consultationData.prescriptionDetails,
        nextVisitDate: consultationData.nextVisitDate ? new Date(consultationData.nextVisitDate) : undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: data?.appointments.length || 0,
    pending: data?.appointments.filter(a => a.status === 'PENDING').length || 0,
    confirmed: data?.appointments.filter(a => a.status === 'CONFIRMED').length || 0,
    completed: data?.appointments.filter(a => a.status === 'COMPLETED').length || 0,
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
          <p className="text-gray-600">Manage your patient appointments and consultations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total</div>
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              </div>
              <Calendar className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Pending</div>
                <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Confirmed</div>
                <div className="text-3xl font-bold text-gray-900">{stats.confirmed}</div>
              </div>
              <Check className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-400 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Completed</div>
                <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
              </div>
              <FileText className="w-10 h-10 text-blue-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="md:w-48">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {!data?.appointments || data.appointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No appointments found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="relative">
                        {appointment.patient.user.image ? (
                          <img 
                            src={appointment.patient.user.image} 
                            alt={appointment.patient.user.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xl">
                            {appointment.patient.user.name.charAt(0)}
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                          appointment.status === 'CONFIRMED' ? 'bg-green-500' :
                          appointment.status === 'PENDING' ? 'bg-yellow-500' :
                          appointment.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patient.user.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{formatDate(appointment.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-blue-600">{formatTime(appointment.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{appointment.patient.user.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="capitalize">{appointment.patient.gender}, {calculateAge(appointment.patient?.dob ?? '08-03-1990')} years</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{appointment.patient.user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{appointment.hospital.name}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedAppointment(appointment)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {appointment.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(appointment.id, 'CONFIRMED')}
                            disabled={updateStatusMutation.isPending}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            Confirm
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
                            disabled={updateStatusMutation.isPending}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                          >
                            <Ban className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => handleStartConsultation(appointment)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Activity className="w-4 h-4" />
                          Start Consultation
                        </button>
                      )}
                      {appointment.status === 'COMPLETED' && (
                        <button 
                          onClick={() => setSelectedAppointment(appointment)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          View Record
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * data.pagination.pageSize) + 1} to {Math.min(currentPage * data.pagination.pageSize, data.pagination.total)} of {data.pagination.total} appointments
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (data.pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= data.pagination.totalPages - 2) {
                    pageNum = data.pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        pageNum === currentPage
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'border border-gray-300 hover:bg-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={currentPage === data.pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div 
            className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => !verifyOtpMutation.isPending && setShowOtpModal(false)}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
                <p className="text-gray-600">Enter the 6-digit OTP to confirm this action</p>
              </div>
              
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-6"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtpInput('');
                  }}
                  disabled={verifyOtpMutation.isPending}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleVerifyOtp}
                  disabled={otpInput.length !== 6 || verifyOtpMutation.isPending}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Verify
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Consultation Modal */}
        {showConsultationModal && selectedAppointment && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => !createConsultationMutation.isPending && setShowConsultationModal(false)}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Complete Consultation</h2>
                  <button 
                    onClick={() => setShowConsultationModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">Patient: {selectedAppointment.patient.user.name}</p>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Remarks
                  </label>
                  <textarea
                    value={consultationData.remarks}
                    onChange={(e) => setConsultationData({...consultationData, remarks: e.target.value})}
                    rows={4}
                    placeholder="Enter consultation notes, diagnosis, and observations..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription Details
                  </label>
                  <textarea
                    value={consultationData.prescriptionDetails}
                    onChange={(e) => setConsultationData({...consultationData, prescriptionDetails: e.target.value})}
                    rows={6}
                    placeholder="Medicine name, dosage, frequency, duration..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Visit Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={consultationData.nextVisitDate}
                    onChange={(e) => setConsultationData({...consultationData, nextVisitDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button 
                  onClick={() => setShowConsultationModal(false)}
                  disabled={createConsultationMutation.isPending}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateConsultation}
                  disabled={!consultationData.remarks || createConsultationMutation.isPending}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {createConsultationMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Complete Consultation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Detail Modal */}
        {selectedAppointment && !showConsultationModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setSelectedAppointment(null)}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
                    <p className="text-gray-600 mt-1">Complete patient information and medical history</p>
                  </div>
                  <button 
                    onClick={() => setSelectedAppointment(null)}
                    className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-700" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 block mb-1">Age / Gender</span>
                      <p className="font-medium text-gray-900 capitalize">{calculateAge(selectedAppointment.patient.dob)} years, {selectedAppointment.patient.gender}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Email Address</span>
                      <p className="font-medium text-gray-900">{selectedAppointment.patient.user.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Phone Number</span>
                      <p className="font-medium text-gray-900">{selectedAppointment.patient.user.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600 block mb-1">Address</span>
                      <p className="font-medium text-gray-900">{selectedAppointment.patient.user.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Medical History */}
                {(selectedAppointment.patient.allergies || selectedAppointment.patient.medicalHistory) && (
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Medical History & Allergies
                    </h3>
                    <div className="space-y-3 text-sm">
                      {selectedAppointment.patient.allergies && (
                        <div>
                          <span className="text-gray-700 font-medium block mb-1">Allergies</span>
                          <p className="text-red-700 bg-red-100 px-3 py-2 rounded">{selectedAppointment.patient.allergies}</p>
                        </div>
                      )}
                      {selectedAppointment.patient.medicalHistory && (
                        <div>
                          <span className="text-gray-700 font-medium block mb-1">Medical History</span>
                          <p className="text-gray-900 bg-white px-3 py-2 rounded border">{selectedAppointment.patient.medicalHistory}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Appointment Details */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 block mb-1">Date</span>
                      <p className="font-medium text-gray-900">{formatDate(selectedAppointment.appointmentDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Time</span>
                      <p className="font-medium text-gray-900">{formatTime(selectedAppointment.appointmentDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Status</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status}
                      </span>
                    </div>
                    {/* <div>
                      <span className="text-gray-600 block mb-1">Security OTP</span>
                      <p className="font-bold text-2xl text-blue-600 tracking-wider">{selectedAppointment.otp}</p>
                    </div> */}
                  </div>
                </div>

                {/* Hospital Information */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Hospital Information
                  </h3>
                  <div className="text-sm space-y-2">
                    <p className="font-medium text-gray-900 text-base">{selectedAppointment.hospital.name}</p>
                    <p className="text-gray-600 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {selectedAppointment.hospital.address}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {selectedAppointment.hospital.contactNumber}
                    </p>
                  </div>
                </div>

                {/* Previous Consultations */}
                {appointmentDetails?.previousConsultations && appointmentDetails.previousConsultations.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Previous Consultations
                    </h3>
                    <div className="space-y-3">
                      {appointmentDetails.previousConsultations.map((consultation, index) => (
                        <div key={consultation.id} className="bg-white rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(consultation.createdAt?.toString() || '')}
                            </span>
                            <span className="text-xs text-gray-500">
                              Dr. {consultation.doctor.user.name}
                            </span>
                          </div>
                          {consultation.remarks && (
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Remarks:</span> {consultation.remarks}
                            </p>
                          )}
                          {consultation.prescriptionDetails && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Prescription:</span> {consultation.prescriptionDetails}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health Metrics */}
                {appointmentDetails?.healthMetrics && appointmentDetails.healthMetrics.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-600" />
                      Recent Health Metrics
                    </h3>
                    <div className="space-y-3">
                      {appointmentDetails.healthMetrics.map((metric, index) => (
                        <div key={metric.id} className="bg-white rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(metric.recordedAt?.toString() || '')}
                            </span>
                            {metric.reportType && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                {metric.reportType}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            {metric.sugarLevel && (
                              <div>
                                <span className="text-gray-600 block">Sugar Level</span>
                                <span className="font-medium text-gray-900">{metric.sugarLevel} mg/dL</span>
                              </div>
                            )}
                            {metric.bloodPressure && (
                              <div>
                                <span className="text-gray-600 block">BP</span>
                                <span className="font-medium text-gray-900">{metric.bloodPressure}</span>
                              </div>
                            )}
                            {metric.cholesterol && (
                              <div>
                                <span className="text-gray-600 block">Cholesterol</span>
                                <span className="font-medium text-gray-900">{metric.cholesterol} mg/dL</span>
                              </div>
                            )}
                          </div>
                          {metric.notes && (
                            <p className="text-sm text-gray-600 mt-2">{metric.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-between bg-gray-50">
                <button
                  onClick={() => exportToPDF(selectedAppointment)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium"
                  >
                    Close
                  </button>
                  {selectedAppointment.status === 'CONFIRMED' && (
                    <button
                      onClick={() => {
                        setShowConsultationModal(true);
                      }}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                    >
                      <Activity className="w-5 h-5" />
                      Start Consultation
                    </button>
                  )}
                  {selectedAppointment.status === 'PENDING' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedAppointment.id, 'CONFIRMED')}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Confirm Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
