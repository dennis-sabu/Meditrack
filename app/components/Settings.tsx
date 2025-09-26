'use client';

import React, { useState } from 'react';
import { FaUser, FaCalendarAlt, FaBell, FaPlus, FaTrash } from 'react-icons/fa';

// Holiday type definition
interface Holiday {
  id: number;
  date: string;
  type: 'Full Day' | 'Half Day';
  reason: string;
}

// Initial holiday data
const initialHolidays: Holiday[] = [
  {
    id: 1,
    date: '2024-01-15',
    type: 'Full Day',
    reason: 'Personal Leave'
  },
  {
    id: 2,
    date: '2024-01-22',
    type: 'Half Day',
    reason: 'Medical Conference'
  },
  {
    id: 3,
    date: '2024-02-01',
    type: 'Full Day',
    reason: 'Vacation'
  }
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    type: 'Full Day' as 'Full Day' | 'Half Day',
    reason: ''
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });

  const handleAddHoliday = () => {
    if (newHoliday.date && newHoliday.reason) {
      const holiday: Holiday = {
        id: Date.now(),
        ...newHoliday
      };
      setHolidays([...holidays, holiday]);
      setNewHoliday({
        date: '',
        type: 'Full Day',
        reason: ''
      });
      setShowAddHolidayModal(false);
    }
  };

  const handleDeleteHoliday = (id: number) => {
    setHolidays(holidays.filter(holiday => holiday.id !== id));
  };

  const getTypeColor = (type: string) => {
    return type === 'Full Day' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600';
  };

  const renderProfileSettings = () => (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Doctor Profile</h2>
      
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
          EA
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Dr. Easin Arafat</h3>
          <p className="text-gray-600">Cardiology</p>
          <p className="text-sm text-gray-500">15 years of experience</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            defaultValue="Dr. Easin Arafat"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            defaultValue="easin.arafat@medilink.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            defaultValue="+1 234 567 8900"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
          <input
            type="text"
            defaultValue="Cardiology"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
          <input
            type="text"
            defaultValue="15 years"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Clinic/Hospital</label>
          <input
            type="text"
            defaultValue="MediLink Medical Center"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            defaultValue="123 Healthcare Ave, Medical City"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
          Update Profile
        </button>
      </div>
    </div>
  );

  const renderHolidayManagement = () => (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Holiday Management</h2>
        <button
          onClick={() => setShowAddHolidayModal(!showAddHolidayModal)}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <FaPlus /> Add Holiday
        </button>
      </div>

      {/* Add Holiday Form - Inline */}
      {showAddHolidayModal && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Holiday</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="mm/dd/yyyy"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newHoliday.type}
                onChange={(e) => setNewHoliday({...newHoliday, type: e.target.value as 'Full Day' | 'Half Day'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input
                type="text"
                value={newHoliday.reason}
                onChange={(e) => setNewHoliday({...newHoliday, reason: e.target.value})}
                placeholder="Reason for holiday"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAddHolidayModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddHoliday}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Holiday
            </button>
          </div>
        </div>
      )}

      {/* Holidays Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holidays.map((holiday) => (
              <tr key={holiday.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {holiday.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(holiday.type)}`}>
                    {holiday.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {holiday.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDeleteHoliday(holiday.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {holidays.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No holidays found. Add a new holiday to get started.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-800">Email Notifications</h3>
            <p className="text-sm text-gray-500">Receive appointment reminders via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-800">SMS Notifications</h3>
            <p className="text-sm text-gray-500">Receive urgent patient updates via SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-800">Push Notifications</h3>
            <p className="text-sm text-gray-500">Receive real-time notifications in browser</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Settings Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">Settings</h1>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'profile'
                  ? 'bg-green-50 text-green-600 border-r-2 border-green-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaUser className="text-lg" />
              Profile Settings
            </button>
            
            <button
              onClick={() => setActiveTab('holiday')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'holiday'
                  ? 'bg-green-50 text-green-600 border-r-2 border-green-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaCalendarAlt className="text-lg" />
              Holiday Management
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-green-50 text-green-600 border-r-2 border-green-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaBell className="text-lg" />
              Notifications
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200">
          <div className="bg-green-50 rounded-lg p-4 text-center mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-semibold">
              👤
            </div>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm">
              Upgrade Today&apos;s pro
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-medium">
              EA
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Easin Arafat</p>
              <p className="text-xs text-gray-500">Free Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeTab === 'profile' && renderProfileSettings()}
        {activeTab === 'holiday' && renderHolidayManagement()}
        {activeTab === 'notifications' && renderNotifications()}
      </div>

    </div>
  );
};

export default Settings;
