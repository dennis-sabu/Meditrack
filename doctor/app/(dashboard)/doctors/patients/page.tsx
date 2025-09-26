'use client'
import React, { useEffect, useState } from 'react';
import { 
  Search, Filter, Users, Phone, Mail, Calendar, 
  ChevronLeft, ChevronRight, User, Activity, 
  Eye, EyeOff, Loader2, FileText, MapPin, Hash
} from 'lucide-react';
import { api } from '@/utils/react';

// Import your tRPC hooks
// import { api } from '~/utils/api';

const PatientsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [revealedFields, setRevealedFields] = useState({});

  // Fetch patients using tRPC
  const { data, isLoading, refetch } = api.user.getPatientsList.useQuery({
    page: currentPage,
    pageSize: 10,
    searchQuery: searchQuery || undefined,
    gender: genderFilter as 'male' | 'female' | 'other' || undefined,
    sortBy: sortBy as "createdAt" | "lastVisit" | undefined, 
    sortOrder: sortOrder as "asc" | "desc" | undefined,
  });

  // Generate complex patient ID with prefix
  const generatePatientId = (userId:number, name:string) => {
    const prefix = 'PT';
    const year = new Date().getFullYear();
    const nameCode = name.substring(0, 2).toUpperCase();
    const paddedId = String(userId).padStart(6, '0');
    return `${prefix}-${year}-${nameCode}-${paddedId}`;
  };

  // Get first name from full name
  const getFirstName = (fullName:string) => {
    return fullName.split(' ')[0];
  };

  // Mask email
  const maskEmail = (email:string, patientId:number) => {
    // if (revealedFields[`email-${patientId.toString()}`]) {
    //   return email;
    // }
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart[0] + '*'.repeat(Math.max(localPart.length - 2, 3)) + localPart[localPart.length - 1];
    const [domainName, ext] = domain.split('.');
    const maskedDomain = domainName[0] + '*'.repeat(Math.max(domainName.length - 2, 2)) + domainName[domainName.length - 1];
    return `${maskedLocal}@${maskedDomain}.${ext}`;
  };

  // Mask phone
  const maskPhone = (phone:string, patientId:number) => {
    // if (revealedFields[`phone-${patientId}`]) {
    //   return phone;
    // }
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      const lastFour = cleaned.slice(-4);
      return '*'.repeat(cleaned.length - 4) + lastFour;
    }
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
  };
  // Toggle field visibility
//   const toggleFieldVisibility = (field:string, patientId:number ) => {
//     setRevealedFields(prev => ({
//       ...prev,
//       [`${field}-${patientId}`]: !prev[`${field}-${patientId}`]
//     }));
//   };

  const formatDate = (date:string | Date    ) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateAge = (dob:string | Date) => {
    if (!dob) return 'N/A';
    const diff = Date.now() - new Date(dob).getTime();
    const age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
  };

  const getGenderIcon = (gender:'male'|'female'|'other' | undefined) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      default:
        return '👤';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading patients...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Patients Directory</h1>
              <p className="text-gray-600">Manage and view patient information</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm px-6 py-4 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">Total Patients</div>
              <div className="text-3xl font-bold text-gray-900">{data?.pagination.total || 0}</div>
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
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">All Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="name">Sort by Name</option>
                <option value="createdAt">Sort by Date</option>
              </select>
            </div>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {!data?.patients || data.patients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No patients found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-gray-700">
                  <div className="col-span-3">Patient Info</div>
                  <div className="col-span-3">Contact Details</div>
                  <div className="col-span-2">Demographics</div>
                  <div className="col-span-3">Last Visit</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {data.patients.map((patient) => {
                  const patientId = generatePatientId(patient.user.id, patient.user.name);
                  const firstName = getFirstName(patient.user.name);
                  
                  return (
                    <div
                      key={patient.id}
                      className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-gray-50 transition-colors items-center"
                    >
                      {/* Patient Info */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          {patient.user.image ? (
                            <img 
                              src={patient.user.image} 
                              alt={firstName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                              {firstName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{firstName}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                              <Hash className="w-3 h-3" />
                              {patientId}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="col-span-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 font-mono text-xs flex-1 truncate">
                            {maskEmail(patient.user.email, patient.id)}
                          </span>
                          {/* <button
                            onClick={() => toggleFieldVisibility('email', patient.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title={revealedFields[`email-${patient.id}`] ? "Hide email" : "Show email"}
                          >
                            {revealedFields[`email-${patient.id}`] ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-500" />
                            )}
                          </button> */}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 font-mono text-xs flex-1">
                            {maskPhone(patient.user?.phone ?? 'no Phone', patient.id)}
                          </span>
                          {/* <button
                            onClick={() => toggleFieldVisibility('phone', patient.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title={revealedFields[`phone-${patient.id}`] ? "Hide phone" : "Show phone"}
                          >
                            {revealedFields[`phone-${patient.id}`] ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-500" />
                            )}
                          </button> */}
                        </div>
                      </div>

                      {/* Demographics */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-2xl">{getGenderIcon(patient.gender as 'male' | 'female' | 'other' | undefined)}</span>
                          <div>
                            <div className="text-gray-900 font-medium capitalize">{patient.gender || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">
                              {patient.dob ? `${calculateAge(patient.dob)} years` : 'Age N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Last Visit */}
                      <div className="col-span-3">
                        {patient.lastAppointment ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-900 font-medium">
                                {formatDate(patient.lastAppointment.date)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Dr. {patient.lastAppointment.doctorName}
                            </div>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              patient.lastAppointment.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-700' 
                                : patient.lastAppointment.status === 'CONFIRMED'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {patient.lastAppointment.status}
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 italic">No visits yet</div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 text-center">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          title="View details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * data.pagination.pageSize) + 1} to {Math.min(currentPage * data.pagination.pageSize, data.pagination.total)} of {data.pagination.total} patients
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

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setSelectedPatient(null)}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {selectedPatient.user.image ? (
                      <img 
                        src={selectedPatient.user.image} 
                        alt={selectedPatient.user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-2xl">
                        {getFirstName(selectedPatient.user.name).charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.user.name}</h2>
                      <p className="text-sm text-gray-600 font-mono flex items-center gap-1 mt-1">
                        <Hash className="w-4 h-4" />
                        {generatePatientId(selectedPatient.user.id, selectedPatient.user.name)}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                  >
                    <span className="text-2xl text-gray-700">×</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 block mb-1">Full Name</span>
                      <p className="font-medium text-gray-900">{selectedPatient.user.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Gender</span>
                      <p className="font-medium text-gray-900 capitalize">{selectedPatient.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Age</span>
                      <p className="font-medium text-gray-900">
                        {selectedPatient.dob ? `${calculateAge(selectedPatient.dob)} years` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Date of Birth</span>
                      <p className="font-medium text-gray-900">
                        {selectedPatient.dob ? formatDate(selectedPatient.dob) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 block mb-1">Email Address</span>
                      <p className="font-medium text-gray-900">{selectedPatient.user.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Phone Number</span>
                      <p className="font-medium text-gray-900">{selectedPatient.user.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Address</span>
                      <p className="font-medium text-gray-900 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                        {selectedPatient.user.address || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                {(selectedPatient.allergies || selectedPatient.medicalHistory) && (
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-600" />
                      Medical Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      {selectedPatient.allergies && (
                        <div>
                          <span className="text-gray-700 font-medium block mb-1">Allergies</span>
                          <p className="text-red-700 bg-red-100 px-3 py-2 rounded">{selectedPatient.allergies}</p>
                        </div>
                      )}
                      {selectedPatient.medicalHistory && (
                        <div>
                          <span className="text-gray-700 font-medium block mb-1">Medical History</span>
                          <p className="text-gray-900 bg-white px-3 py-2 rounded border">{selectedPatient.medicalHistory}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Last Appointment */}
                {selectedPatient.lastAppointment && (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Last Appointment
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 block mb-1">Date</span>
                        <p className="font-medium text-gray-900">{formatDate(selectedPatient.lastAppointment.date)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Doctor</span>
                        <p className="font-medium text-gray-900">Dr. {selectedPatient.lastAppointment.doctorName}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600 block mb-1">Status</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          selectedPatient.lastAppointment.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : selectedPatient.lastAppointment.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {selectedPatient.lastAppointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Account Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 block mb-1">Patient Since</span>
                      <p className="font-medium text-gray-900">{formatDate(selectedPatient.user.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Patient ID</span>
                      <p className="font-medium text-gray-900 font-mono text-xs">
                        {generatePatientId(selectedPatient.user.id, selectedPatient.user.name)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsListPage;