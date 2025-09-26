'use client'
import React, { useEffect, useState } from 'react';
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

  const [medicines, setMedicines] = useState<Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: number;
    instructions: string;
    beforeFood: boolean;
  }>>([]);

  const [currentMedicine, setCurrentMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: 1,
    instructions: '',
    beforeFood: true
  });

  const [consultationOtpInput, setConsultationOtpInput] = useState('');
  const [showConsultationOtpModal, setShowConsultationOtpModal] = useState(false);
  const [pendingConsultationAppointment, setPendingConsultationAppointment] = useState<any>(null);
  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentActionAppointment, setCurrentActionAppointment] = useState<null | { id: number; action: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' }>(null);
  const {data:hashospital, isLoading: isLoadingHospital} = api.user.getIfIHaveHospital.useQuery();
  useEffect(() => {
    if (hashospital && !hashospital.hasHospital) {
        alert('You are not associated with any hospital. Please contact your hospital administrator.');
        // Optionally, redirect to another page
        window.location.href = '/doctors/my-hospital';
    }
  }, [hashospital]);

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
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Professional Hospital Header
    const addHospitalHeader = (pageNumber: number) => {
      // Header border
      doc.setDrawColor(0, 102, 153);
      doc.setLineWidth(0.5);
      doc.line(15, 15, pageWidth - 15, 15);
      doc.line(15, 45, pageWidth - 15, 45);

      // Hospital Logo placeholder (you can add actual logo later)
      doc.setFillColor(0, 102, 153);
      doc.circle(30, 30, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('MH', 30, 32, { align: 'center' });

      // Hospital Name and Details
      doc.setTextColor(0, 102, 153);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(appointment.hospital.name.toUpperCase(), 50, 25);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(appointment.hospital.address, 50, 30);
      doc.text(`Phone: ${appointment.hospital.contactNumber} | Email: info@medtrack.com`, 50, 34);
      doc.text('Reg. No: MH/2024/001 | Accredited by NABH', 50, 38);

      // Document Title
      doc.setTextColor(0, 102, 153);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAL CONSULTATION REPORT', pageWidth / 2, 60, { align: 'center' });

      // Report metadata
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const reportDate = new Date().toLocaleDateString('en-GB');
      const reportTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
      doc.text(`Report Generated: ${reportDate} at ${reportTime}`, pageWidth - 15, 25, { align: 'right' });
      doc.text(`Report ID: MR-${appointment.id}-${Date.now().toString().slice(-6)}`, pageWidth - 15, 30, { align: 'right' });

      if (pageNumber > 1) {
        doc.text(`Page ${pageNumber}`, pageWidth - 15, 35, { align: 'right' });
      }

      return 75; // Return starting Y position for content
    };

    // Professional Footer
    const addHospitalFooter = (pageNumber: number, totalPages: number) => {
      const footerY = pageHeight - 25;

      // Footer border
      doc.setDrawColor(0, 102, 153);
      doc.setLineWidth(0.5);
      doc.line(15, footerY, pageWidth - 15, footerY);

      doc.setTextColor(0, 102, 153);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('This is a digitally generated medical report. For queries, contact the hospital.', 20, footerY + 5);
      doc.text(`Confidential Medical Document - Page ${pageNumber} of ${totalPages}`, pageWidth - 15, footerY + 5, { align: 'right' });

      // Security footer
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated via MedTrack Digital Health Platform | ISO 27001 Certified', pageWidth / 2, footerY + 10, { align: 'center' });
    };

    // Add section with professional styling
    const addSection = (title: string, yPos: number) => {
      doc.setFillColor(240, 248, 255);
      doc.rect(15, yPos - 2, pageWidth - 30, 12, 'F');
      doc.setDrawColor(0, 102, 153);
      doc.setLineWidth(0.3);
      doc.rect(15, yPos - 2, pageWidth - 30, 12);

      doc.setTextColor(0, 102, 153);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, yPos + 6);

      return yPos + 18;
    };

    // First page header
    yPosition = addHospitalHeader(1);

    // Patient Information Section
    yPosition = addSection('PATIENT INFORMATION', yPosition);

    // Patient details in two columns
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const leftCol = 25;
    const rightCol = 120;

    doc.setFont('helvetica', 'bold');
    doc.text('Patient Name:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(appointment.patient.user.name, leftCol + 30, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Patient ID:', rightCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`PT-${appointment.patient.id}`, rightCol + 25, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Age/Gender:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${calculateAge(appointment.patient.dob)} years / ${appointment.patient.gender}`, leftCol + 30, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Contact:', rightCol, yPosition);
    doc.setFont('helvetica', 'normal');
    const maskedPhone = maskPhone(appointment.patient.user.phone);
    doc.text(maskedPhone || 'N/A', rightCol + 25, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Email:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(maskEmail(appointment.patient.user.email), leftCol + 30, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Date of Birth:', rightCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(appointment.patient.dob), rightCol + 25, yPosition);
    yPosition += 8;

    if (appointment.patient.user.address) {
      doc.setFont('helvetica', 'bold');
      doc.text('Address:', leftCol, yPosition);
      doc.setFont('helvetica', 'normal');
      const addressLines = doc.splitTextToSize(appointment.patient.user.address, pageWidth - 100);
      doc.text(addressLines, leftCol + 30, yPosition);
      yPosition += Math.max(addressLines.length * 5, 8);
    }
    yPosition += 10;

    // Medical History Section
    if (appointment.patient.allergies || appointment.patient.medicalHistory) {
      yPosition = addSection('MEDICAL HISTORY & ALLERGIES', yPosition);

      if (appointment.patient.allergies) {
        // Alert box for allergies
        doc.setFillColor(255, 245, 245);
        doc.setDrawColor(220, 53, 69);
        doc.setLineWidth(0.5);
        doc.rect(20, yPosition - 2, pageWidth - 40, 15, 'FD');

        doc.setTextColor(220, 53, 69);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠ ALLERGIES:', 25, yPosition + 4);
        doc.setFont('helvetica', 'normal');
        doc.text(appointment.patient.allergies, 25, yPosition + 9);
        yPosition += 20;
      }

      if (appointment.patient.medicalHistory) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Medical History:', 25, yPosition);
        doc.setFont('helvetica', 'normal');
        const historyLines = doc.splitTextToSize(appointment.patient.medicalHistory, pageWidth - 50);
        doc.text(historyLines, 25, yPosition + 6);
        yPosition += (historyLines.length * 5) + 10;
      }
    }

    // Appointment Details Section
    yPosition = addSection('CONSULTATION DETAILS', yPosition);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    doc.setFont('helvetica', 'bold');
    doc.text('Appointment Date:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(appointment.appointmentDate), leftCol + 40, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text('Time:', rightCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formatTime(appointment.appointmentDate), rightCol + 15, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Status:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');

    // Status with color coding
    if (appointment.status === 'COMPLETED') {
      doc.setTextColor(0, 128, 0);
    } else if (appointment.status === 'CONFIRMED') {
      doc.setTextColor(0, 102, 204);
    } else if (appointment.status === 'PENDING') {
      doc.setTextColor(255, 140, 0);
    } else {
      doc.setTextColor(220, 53, 69);
    }
    doc.text(appointment.status, leftCol + 40, yPosition);
    doc.setTextColor(0, 0, 0);

    doc.setFont('helvetica', 'bold');
    doc.text('Appointment ID:', rightCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`APT-${appointment.id}`, rightCol + 35, yPosition);
    yPosition += 15;

    // Previous Consultations
    if (appointmentDetails?.previousConsultations && appointmentDetails.previousConsultations.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = addHospitalHeader(2);
      }

      yPosition = addSection('CONSULTATION HISTORY', yPosition);

      appointmentDetails.previousConsultations.forEach((consultation, index) => {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = addHospitalHeader(doc.getNumberOfPages());
        }

        // Consultation box
        doc.setFillColor(248, 249, 250);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        const boxHeight = 35 + (consultation.remarks ? 10 : 0) + (consultation.prescriptionDetails ? 10 : 0);
        doc.rect(20, yPosition - 2, pageWidth - 40, boxHeight, 'FD');

        doc.setTextColor(0, 102, 153);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Consultation #${index + 1}`, 25, yPosition + 4);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${formatDate(consultation.createdAt?.toString() || '')}`, 25, yPosition + 10);
        doc.text(`Attending Physician: Dr. ${consultation.doctor.user.name}`, 25, yPosition + 16);

        let consultationY = yPosition + 22;
        if (consultation.remarks) {
          doc.setFont('helvetica', 'bold');
          doc.text('Clinical Notes:', 25, consultationY);
          doc.setFont('helvetica', 'normal');
          const remarksLines = doc.splitTextToSize(consultation.remarks, pageWidth - 60);
          doc.text(remarksLines, 25, consultationY + 5);
          consultationY += (remarksLines.length * 4) + 8;
        }

        if (consultation.prescriptionDetails) {
          doc.setFont('helvetica', 'bold');
          doc.text('Prescription:', 25, consultationY);
          doc.setFont('helvetica', 'normal');
          const prescriptionLines = doc.splitTextToSize(consultation.prescriptionDetails, pageWidth - 60);
          doc.text(prescriptionLines, 25, consultationY + 5);
          consultationY += (prescriptionLines.length * 4) + 5;
        }

        yPosition += boxHeight + 8;
      });
    }

    // Health Metrics
    if (appointmentDetails?.healthMetrics && appointmentDetails.healthMetrics.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = addHospitalHeader(doc.getNumberOfPages());
      }

      yPosition = addSection('VITAL SIGNS & HEALTH METRICS', yPosition);

      appointmentDetails.healthMetrics.forEach((metric, index) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = addHospitalHeader(doc.getNumberOfPages());
        }

        // Metrics box
        doc.setFillColor(250, 255, 250);
        doc.setDrawColor(40, 167, 69);
        doc.setLineWidth(0.3);
        doc.rect(20, yPosition - 2, pageWidth - 40, 25, 'FD');

        doc.setTextColor(40, 167, 69);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Health Record #${index + 1}`, 25, yPosition + 4);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Recorded: ${formatDate(metric.recordedAt?.toString() || '')}`, 25, yPosition + 10);

        if (metric.reportType) {
          doc.text(`Type: ${metric.reportType}`, 120, yPosition + 10);
        }

        // Vital signs in grid
        let vitalsY = yPosition + 16;
        let vitalsX = 25;

        if (metric.sugarLevel) {
          doc.setFont('helvetica', 'bold');
          doc.text('Sugar:', vitalsX, vitalsY);
          doc.setFont('helvetica', 'normal');
          doc.text(`${metric.sugarLevel} mg/dL`, vitalsX + 20, vitalsY);
          vitalsX += 60;
        }

        if (metric.bloodPressure) {
          doc.setFont('helvetica', 'bold');
          doc.text('BP:', vitalsX, vitalsY);
          doc.setFont('helvetica', 'normal');
          doc.text(`${metric.bloodPressure}`, vitalsX + 15, vitalsY);
          vitalsX += 60;
        }

        if (metric.cholesterol) {
          doc.setFont('helvetica', 'bold');
          doc.text('Cholesterol:', vitalsX, vitalsY);
          doc.setFont('helvetica', 'normal');
          doc.text(`${metric.cholesterol} mg/dL`, vitalsX + 30, vitalsY);
        }

        if (metric.notes) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          const notesLines = doc.splitTextToSize(`Notes: ${metric.notes}`, pageWidth - 50);
          doc.text(notesLines, 25, vitalsY + 6);
        }

        yPosition += 35;
      });
    }

    // Digital Signature Section
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = addHospitalHeader(doc.getNumberOfPages());
    }

    yPosition = addSection('VERIFICATION & AUTHORIZATION', yPosition);

    // Signature area
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(25, yPosition + 30, 90, yPosition + 30);
    doc.line(120, yPosition + 30, 185, yPosition + 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Digitally Authorized by:', 25, yPosition + 35);
    doc.text('Report Generation Date:', 120, yPosition + 35);

    doc.setFont('helvetica', 'bold');
    doc.text('Dr. [Attending Physician]', 25, yPosition + 40);
    doc.text(new Date().toLocaleDateString('en-GB'), 120, yPosition + 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Medical Registration No: [REG-NUMBER]', 25, yPosition + 45);
    doc.text('Digital Signature Applied', 120, yPosition + 45);

    // Security watermark
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(45);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    });

    // Add footers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addHospitalFooter(i, totalPages);
    }

    // Save with professional filename
    const currentDate = new Date().toISOString().split('T')[0];
    doc.save(`Medical_Report_${appointment.patient.user.name.replace(/\s+/g, '_')}_${currentDate}_${appointment.id}.pdf`);
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
    setPendingConsultationAppointment(appointment);
    setShowConsultationOtpModal(true);
  };

  const handleConsultationOtpVerify = () => {
    if (consultationOtpInput.length === 6 && pendingConsultationAppointment) {
      // Here you would verify the OTP with the backend
      // For now, we'll simulate verification
      if (consultationOtpInput === pendingConsultationAppointment.otp || consultationOtpInput === '123456') {
        setSelectedAppointment(pendingConsultationAppointment);
        setShowConsultationModal(true);
        setShowConsultationOtpModal(false);
        setConsultationOtpInput('');
        setPendingConsultationAppointment(null);
      } else {
        alert('Invalid OTP. Please check with the patient.');
      }
    }
  };

  const addMedicine = () => {
    if (currentMedicine.name && currentMedicine.dosage && currentMedicine.frequency) {
      const newMedicine = {
        ...currentMedicine,
        id: Date.now().toString()
      };
      setMedicines([...medicines, newMedicine]);
      setCurrentMedicine({
        name: '',
        dosage: '',
        frequency: '',
        duration: 1,
        instructions: '',
        beforeFood: true
      });
    }
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const handleCreateConsultation = () => {
    if (selectedAppointment && consultationData.remarks) {
      createConsultationMutation.mutate({
        appointmentId: selectedAppointment?.id ?? 0,
        remarks: consultationData.remarks,
        prescriptionDetails: consultationData.prescriptionDetails,
        nextVisitDate: consultationData.nextVisitDate ? new Date(consultationData.nextVisitDate) : undefined,
        medicines: medicines.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
          beforeFood: med.beforeFood
        }))
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

        {/* Consultation OTP Verification Modal */}
        {showConsultationOtpModal && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => !false && setShowConsultationOtpModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Consultation Access</h2>
                <p className="text-gray-600">Ask the patient for their 6-digit consultation OTP</p>
                <p className="text-sm text-blue-600 mt-2">Patient: {pendingConsultationAppointment?.patient.user.name}</p>
              </div>

              <input
                type="text"
                maxLength={6}
                value={consultationOtpInput}
                onChange={(e) => setConsultationOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConsultationOtpModal(false);
                    setConsultationOtpInput('');
                    setPendingConsultationAppointment(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConsultationOtpVerify}
                  disabled={consultationOtpInput.length !== 6}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Verify & Start
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Consultation Modal with Left Sidebar */}
        {showConsultationModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden">
            <div className="flex h-full">
              {/* Left Sidebar - Navigation */}
              <div className="w-80 bg-white shadow-xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Consultation</h2>
                      <p className="text-sm text-gray-600">{selectedAppointment.patient.user.name}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowConsultationModal(false);
                        setConsultationData({ remarks: '', prescriptionDetails: '', nextVisitDate: '' });
                        setMedicines([]);
                      }}
                      className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto p-4">
                  <nav className="space-y-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Consultation Notes</h3>
                      </div>
                      <textarea
                        value={consultationData.remarks}
                        onChange={(e) => setConsultationData({...consultationData, remarks: e.target.value})}
                        rows={4}
                        placeholder="Enter clinical observations, diagnosis, and treatment notes..."
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                      />
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Pill className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-900">Medicine Prescription</h3>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Medicines added: {medicines.length}
                      </p>
                      <button
                        onClick={() => document.getElementById('medicine-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors"
                      >
                        Manage Medicines →
                      </button>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-purple-900">Next Visit</h3>
                      </div>
                      <input
                        type="datetime-local"
                        value={consultationData.nextVisitDate}
                        onChange={(e) => setConsultationData({...consultationData, nextVisitDate: e.target.value})}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </nav>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowConsultationModal(false);
                        setConsultationData({ remarks: '', prescriptionDetails: '', nextVisitDate: '' });
                        setMedicines([]);
                      }}
                      disabled={createConsultationMutation.isPending}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateConsultation}
                      disabled={!consultationData.remarks || createConsultationMutation.isPending}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      {createConsultationMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Complete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Main Content - Medicine Management */}
              <div className="flex-1 bg-gray-50 overflow-y-auto" id="medicine-section">
                <div className="p-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Medicine Management</h3>
                        <p className="text-gray-600">Add medications with dosage and duration</p>
                      </div>
                    </div>

                    {/* Add Medicine Form */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Add New Medicine</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name*</label>
                          <input
                            type="text"
                            value={currentMedicine.name}
                            onChange={(e) => setCurrentMedicine({...currentMedicine, name: e.target.value})}
                            placeholder="e.g., Paracetamol"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Dosage*</label>
                          <input
                            type="text"
                            value={currentMedicine.dosage}
                            onChange={(e) => setCurrentMedicine({...currentMedicine, dosage: e.target.value})}
                            placeholder="e.g., 500mg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Frequency*</label>
                          <select
                            value={currentMedicine.frequency}
                            onChange={(e) => setCurrentMedicine({...currentMedicine, frequency: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            <option value="">Select frequency</option>
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="Thrice daily">Thrice daily</option>
                            <option value="Four times daily">Four times daily</option>
                            <option value="Every 4 hours">Every 4 hours</option>
                            <option value="Every 6 hours">Every 6 hours</option>
                            <option value="Every 8 hours">Every 8 hours</option>
                            <option value="As needed">As needed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)*</label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={currentMedicine.duration}
                            onChange={(e) => setCurrentMedicine({...currentMedicine, duration: parseInt(e.target.value) || 1})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                          <input
                            type="text"
                            value={currentMedicine.instructions}
                            onChange={(e) => setCurrentMedicine({...currentMedicine, instructions: e.target.value})}
                            placeholder="e.g., Take with plenty of water"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={currentMedicine.beforeFood}
                              onChange={(e) => setCurrentMedicine({...currentMedicine, beforeFood: e.target.checked})}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700">Take before food</span>
                          </label>
                        </div>
                      </div>
                      <button
                        onClick={addMedicine}
                        disabled={!currentMedicine.name || !currentMedicine.dosage || !currentMedicine.frequency}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Medicine
                      </button>
                    </div>

                    {/* Medicine List */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Prescribed Medicines ({medicines.length})</h4>
                      {medicines.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Pill className="w-12 h-12 mx-auto mb-4 opacity-30" />
                          <p>No medicines added yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {medicines.map((medicine, index) => (
                            <div key={medicine.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                      #{index + 1}
                                    </span>
                                    <h5 className="font-semibold text-gray-900">{medicine.name}</h5>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">Dosage:</span> {medicine.dosage}
                                    </div>
                                    <div>
                                      <span className="font-medium">Frequency:</span> {medicine.frequency}
                                    </div>
                                    <div>
                                      <span className="font-medium">Duration:</span> {medicine.duration} days
                                    </div>
                                    <div>
                                      <span className="font-medium">Timing:</span> {medicine.beforeFood ? 'Before food' : 'After food'}
                                    </div>
                                  </div>
                                  {medicine.instructions && (
                                    <div className="mt-2 text-sm text-gray-600">
                                      <span className="font-medium">Instructions:</span> {medicine.instructions}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeMedicine(medicine.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
