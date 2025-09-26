'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaTachometerAlt, 
  FaChartBar, 
  FaCalendarAlt, 
  FaCalendar, 
  FaBell, 
  FaCog,
  FaUser,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const SideNavbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: FaTachometerAlt, path: '/Doctorsdashboard', color: 'text-gray-600' },
    { name: 'Analytics', icon: FaChartBar, path: '/Analytics', color: 'text-green-500' },
    { name: 'Schedule', icon: FaCalendarAlt, path: '/schedule', color: 'text-gray-600' },
    { name: 'Calendar', icon: FaCalendar, path: '/calendar', color: 'text-gray-600' },
    { name: 'Notification', icon: FaBell, path: '/notification', color: 'text-gray-600' },
    { name: 'Settings', icon: FaCog, path: '/settings', color: 'text-gray-600' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? (
            <FaTimes className="text-gray-600 text-xl" />
          ) : (
            <FaBars className="text-gray-600 text-xl" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white h-screen shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                      isActive 
                        ? 'bg-green-50 text-green-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`text-lg ${isActive ? 'text-green-500' : item.color}`} />
                    <span className="font-medium">{item.name}</span>
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
    </>
  );
};

export default SideNavbar;
