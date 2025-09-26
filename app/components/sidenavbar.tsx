'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaTachometerAlt, 
  FaChartBar, 
  FaFileInvoice, 
  FaCalendarAlt, 
  FaCalendar, 
  FaEnvelope, 
  FaBell, 
  FaCog,
  FaUser
} from 'react-icons/fa';

const SideNavbar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: FaTachometerAlt, path: '/Doctorsdashboard', color: 'text-gray-600' },
    { name: 'Analytics', icon: FaChartBar, path: '/Analytics', color: 'text-green-500' },
    { name: 'Invoice', icon: FaFileInvoice, path: '/invoice', color: 'text-gray-600' },
    { name: 'Schedule', icon: FaCalendarAlt, path: '/schedule', color: 'text-gray-600' },
    { name: 'Calendar', icon: FaCalendar, path: '/calendar', color: 'text-gray-600' },
    { name: 'Messages', icon: FaEnvelope, path: '/messages', color: 'text-gray-600', badge: '10' },
    { name: 'Notification', icon: FaBell, path: '/notification', color: 'text-gray-600' },
    { name: 'Settings', icon: FaCog, path: '/settings', color: 'text-gray-600' },
  ];

  return (
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-xl font-semibold text-gray-800">Medilink</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path;
            
            return (
              <li key={index}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                    isActive 
                      ? 'bg-green-50 text-green-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`text-lg ${isActive ? 'text-green-500' : item.color}`} />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Upgrade Section */}
      <div className="p-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
            <FaUser className="text-white text-2xl" />
          </div>
          <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors">
            Upgrade Today&apos;s pro
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">EA</span>
          </div>
          <div>
            <p className="font-medium text-gray-800">Easin Arafat</p>
            <p className="text-sm text-gray-500">Free Account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;
