'use client';
import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Briefcase, 
  Calendar,
  FileText,
  DollarSign,
  Clock,
  RefreshCw,
  Eye,
  User,
  GraduationCap
} from 'lucide-react';
import { api } from '@/utils/react';

const HospitalAdminRequestsPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get pending requests
  const { data: requests, isLoading, refetch } = api.hospital.getPendingRequests.useQuery();

  // Approve mutation
  const approveMutation = api.hospital.approveJoinRequest.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      setSelectedDoctor(null);
    },
  });

  // Reject mutation
  const rejectMutation = api.hospital.rejectJoinRequest.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      setSelectedDoctor(null);
    },
  });

  const handleViewDetails = (request:any) => {
    setSelectedDoctor(request);
    setIsModalOpen(true);
  };

  const handleApprove = (requestId:number) => {
    if (window.confirm('Are you sure you want to approve this doctor?')) {
      approveMutation.mutate({ requestId });
    }
  };

  const handleReject = (requestId:number) => {
    if (window.confirm('Are you sure you want to reject this doctor request?')) {
      rejectMutation.mutate({ requestId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading requests...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Join Requests</h1>
              <p className="text-gray-600">Review and approve doctors to join your hospital</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600">{requests?.length || 0}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today{'\''}s Requests</p>
                <p className="text-3xl font-bold text-blue-600">
                  {requests?.filter(r => {
                    const today = new Date().toDateString();
                    return new Date(r.createdAt?.toDateString() ?? '').toDateString() === today;
                  }).length || 0}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Doctors</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <Users className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* Requests List */}
        {requests && requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          request.doctor.user.image ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.doctor.user.name}`
                        }
                        alt={request.doctor.user.name}
                        className="w-16 h-16 rounded-full border-2 border-blue-500"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{request.doctor.user.name}</h3>
                        <p className="text-sm text-gray-600">{request.doctor.specialization || 'General Physician'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {request.department}
                          </span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            Pending Review
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p className="font-medium">Requested</p>
                      <p>{new Date(request.createdAt?.toDateString() ?? '').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(request.createdAt?.toDateString() ?? '').toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{request.doctor.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{request.doctor.user.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{request.doctor.experienceYears || 0} years experience</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Full Details
                    </button>
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {approveMutation.isPending ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={rejectMutation.isPending}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4" />
                      {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-600">There are no doctor join requests at the moment</p>
          </div>
        )}

        {/* Detail Modal */}
        {isModalOpen && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        selectedDoctor.doctor.user.image ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.doctor.user.name}`
                      }
                      alt={selectedDoctor.doctor.user.name}
                      className="w-20 h-20 rounded-full border-4 border-white"
                    />
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{selectedDoctor.doctor.user.name}</h2>
                      <p className="text-blue-100">{selectedDoctor.doctor.specialization || 'General Physician'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-white text-blue-700 text-xs font-medium rounded-full">
                          {selectedDoctor.department}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Email Address</p>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900 font-medium">{selectedDoctor.doctor.user.email}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900 font-medium">{selectedDoctor.doctor.user.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    {selectedDoctor.doctor.user.address && (
                      <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Address</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 font-medium">{selectedDoctor.doctor.user.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDoctor.doctor.medicalLicenseNumber && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Medical License Number</p>
                        <p className="text-gray-900 font-medium">{selectedDoctor.doctor.medicalLicenseNumber}</p>
                      </div>
                    )}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Years of Experience</p>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900 font-medium">{selectedDoctor.doctor.experienceYears || 0} years</p>
                      </div>
                    </div>
                    {selectedDoctor.doctor.consultationFee && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 font-medium">₹{selectedDoctor.doctor.consultationFee}</p>
                        </div>
                      </div>
                    )}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Verification Status</p>
                      <div className="flex items-center gap-2">
                        {selectedDoctor.doctor.isVerified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-700 font-medium">Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span className="text-yellow-700 font-medium">Pending Verification</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                {selectedDoctor.doctor.qualifications && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Qualifications
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-line">{selectedDoctor.doctor.qualifications}</p>
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedDoctor.doctor.bio && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Biography
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-line">{selectedDoctor.doctor.bio}</p>
                    </div>
                  </div>
                )}

                {/* Request Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Request Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Requested Department</p>
                      <p className="text-gray-900 font-medium">{selectedDoctor.department}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Request Date</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(selectedDoctor.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-lg border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => handleReject(selectedDoctor.id)}
                  disabled={rejectMutation.isPending}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject Request'}
                </button>
                <button
                  onClick={() => handleApprove(selectedDoctor.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {approveMutation.isPending ? 'Approving...' : 'Approve & Add to Hospital'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalAdminRequestsPage;