'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaClock } from 'react-icons/fa';

// Patient type definition
interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

// Schedule type definition
interface Schedule {
  id: number;
  patientName: string;
  event: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

// Dummy patient data for dropdown
const patientsData: Patient[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1234567890',
    avatar: '👨'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1234567891',
    avatar: '👩'
  },
  {
    id: 3,
    name: 'Mike Brown',
    email: 'mike.brown@email.com',
    phone: '+1234567892',
    avatar: '👨'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1234567893',
    avatar: '👩'
  },
  {
    id: 5,
    name: 'Robert Wilson',
    email: 'robert.wilson@email.com',
    phone: '+1234567894',
    avatar: '👨'
  },
  {
    id: 6,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+1234567895',
    avatar: '👩'
  },
  {
    id: 7,
    name: 'David Miller',
    email: 'david.miller@email.com',
    phone: '+1234567896',
    avatar: '👨'
  },
  {
    id: 8,
    name: 'Jennifer Taylor',
    email: 'jennifer.taylor@email.com',
    phone: '+1234567897',
    avatar: '👩'
  }
];

// Dummy schedule data
const initialSchedules: Schedule[] = [
  {
    id: 1,
    patientName: 'John Smith',
    event: 'Regular Checkup',
    date: '2024-01-20',
    startTime: '09:00',
    endTime: '09:30',
    status: 'Scheduled'
  },
  {
    id: 2,
    patientName: 'Sarah Johnson',
    event: 'Blood Test Review',
    date: '2024-01-20',
    startTime: '10:00',
    endTime: '10:15',
    status: 'Completed'
  },
  {
    id: 3,
    patientName: 'Mike Brown',
    event: 'Follow-up Consultation',
    date: '2024-01-21',
    startTime: '14:00',
    endTime: '14:45',
    status: 'Scheduled'
  }
];

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    patientName: '',
    event: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  
  // Patient search states
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddSchedule = () => {
    if (newSchedule.patientName && newSchedule.event && newSchedule.date && newSchedule.startTime && newSchedule.endTime) {
      const schedule: Schedule = {
        id: Date.now(),
        ...newSchedule,
        status: 'Scheduled'
      };
      setSchedules([...schedules, schedule]);
      setNewSchedule({
        patientName: '',
        event: '',
        date: '',
        startTime: '',
        endTime: ''
      });
      setShowAddModal(false);
      setShowDropdown(false);
    }
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const handleEditSchedule = (id: number) => {
    console.log('Edit schedule:', id);
    // Add edit functionality here
  };

  const handlePatientSearch = (value: string) => {
    setNewSchedule({...newSchedule, patientName: value});
    
    if (value.trim()) {
      const results = patientsData.filter(patient => 
        patient.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    setNewSchedule({...newSchedule, patientName: patient.name});
    setShowDropdown(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-600';
      case 'Completed':
        return 'bg-green-100 text-green-600';
      case 'Cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Schedule Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <FaPlus /> Add Patient Schedule
        </button>
      </div>

      {/* Add New Schedule Form */}
      {showAddModal && (
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Schedule</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
              <input
                type="text"
                value={newSchedule.patientName}
                onChange={(e) => handlePatientSearch(e.target.value)}
                onFocus={() => newSchedule.patientName && setShowDropdown(true)}
                placeholder="Type patient name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              
              {/* Patient Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-1">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => selectPatient(patient)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-lg">{patient.avatar}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      </div>
                      <div className="text-xs text-gray-400">{patient.phone}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No results message */}
              {showDropdown && searchResults.length === 0 && newSchedule.patientName.trim() && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1">
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    No patients found matching &quot;{newSchedule.patientName}&quot;
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event/Procedure</label>
              <input
                type="text"
                value={newSchedule.event}
                onChange={(e) => setNewSchedule({...newSchedule, event: e.target.value})}
                placeholder="e.g., Regular Checkup, Blood Test..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <FaClock className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <FaClock className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSchedule}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Schedule
            </button>
          </div>
        </div>
      )}

      {/* Recent Schedules */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Recent Schedules</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule.patientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.event}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.startTime} - {schedule.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSchedule(schedule.id)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {schedules.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No schedules found. Add a new schedule to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;
