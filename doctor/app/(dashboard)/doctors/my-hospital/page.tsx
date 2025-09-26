'use client'
import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, CheckCircle, Clock, XCircle, Search, Send, RefreshCw } from 'lucide-react';
import { api } from '@/utils/react';

const MyHospitalPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [department, setDepartment] = useState('');

  // Get doctor's hospital connection
  const { data: myHospital, isLoading: loadingMyHospital, refetch: refetchMyHospital } = 
    api.hospital.getMyHospital.useQuery();

  // Get available hospitals list
  const { data: availableHospitals, isLoading: loadingHospitals } = 
    api.hospital.getAvailableHospitals.useQuery(
      { search: searchQuery },
      { enabled: !myHospital?.hospital }
    );

  // Get pending requests
  const { data: pendingRequests, refetch: refetchRequests } = 
    api.hospital.getMyHospitalRequests.useQuery();

  // Send hospital join request
  const sendRequest = api.hospital.sendJoinRequest.useMutation({
    onSuccess: () => {
      setSelectedHospital(null);
      setDepartment('');
      refetchRequests();
    },
  });

  // Cancel request
  const cancelRequest = api.hospital.cancelJoinRequest.useMutation({
    onSuccess: () => {
      refetchRequests();
    },
  });

  const handleSendRequest = () => {
    if (selectedHospital && department) {
      sendRequest.mutate({
        hospitalId: (selectedHospital as any)?.id ?? 0,
        department,
      });
    }
  };

  if (loadingMyHospital) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading hospital information...</p>
        </div>
      </div>
    );
  }

  // Doctor is connected to a hospital
  if (myHospital?.hospital) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Hospital</h1>
            <p className="text-gray-600">Your affiliated hospital information</p>
          </div>

          {/* Hospital Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{myHospital.hospital.name}</h2>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-blue-100">Verified Hospital</span>
                    </div>
                  </div>
                </div>
                {myHospital.hospital.isVerified && (
                  <div className="px-4 py-2 bg-green-500 rounded-full text-sm font-semibold">
                    Active
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  
                  {myHospital.hospital.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Address</p>
                        <p className="text-gray-900">{myHospital.hospital.address}</p>
                      </div>
                    </div>
                  )}

                  {myHospital.hospital.contactNumber && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Phone</p>
                        <p className="text-gray-900">{myHospital.hospital.contactNumber}</p>
                      </div>
                    </div>
                  )}

                  {myHospital.hospital.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="text-gray-900">{myHospital.hospital.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hospital Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Hospital Details</h3>
                  
                  {myHospital.hospital.registrationNumber && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Registration Number</p>
                      <p className="text-gray-900 font-medium">{myHospital.hospital.registrationNumber}</p>
                    </div>
                  )}

                  {myHospital.joinedAt && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Joined On</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(myHospital.joinedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="text-gray-900 font-medium capitalize">{myHospital.hospital.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm text-gray-600 mb-2">Total Doctors</h4>
              <p className="text-3xl font-bold text-gray-900">{myHospital.totalDoctors || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm text-gray-600 mb-2">Total Patients</h4>
              <p className="text-3xl font-bold text-gray-900">{myHospital.totalPatients || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm text-gray-600 mb-2">Appointments Today</h4>
              <p className="text-3xl font-bold text-gray-900">{myHospital.todayAppointments || 0}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Doctor not connected - show hospital list and request form
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join a Hospital</h1>
          <p className="text-gray-600">Connect with a hospital to start managing appointments</p>
        </div>

        {/* Pending Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Pending Requests
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{request.hospital.name}</p>
                    <p className="text-sm text-gray-600">Department: {request.department}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested on {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <button
                    onClick={() => cancelRequest.mutate({ requestId: request.id })}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search hospitals by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Hospital List */}
        {loadingHospitals ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading hospitals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableHospitals?.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{hospital.name}</h3>
                  {hospital.isVerified && (
                    <div className="flex items-center gap-1 text-sm text-blue-100">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  {hospital.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-gray-600">{hospital.address}</p>
                    </div>
                  )}

                  {hospital.contactNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-600">{hospital.contactNumber}</p>
                    </div>
                  )}

                  {hospital.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-600">{hospital.email}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedHospital(hospital)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Request
                  </button>
                </div>
              </div>
            ))}

            {availableHospitals && availableHospitals.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No hospitals found</p>
              </div>
            )}
          </div>
        )}

        {/* Request Modal */}
        {selectedHospital && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Send Join Request to {selectedHospital.name ?? 'Hospital'}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department / Specialization
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Cardiology, Neurology, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedHospital(null);
                    setDepartment('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={!department || sendRequest.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendRequest.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
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

export default MyHospitalPage;