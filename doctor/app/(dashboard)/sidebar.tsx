'use client';

import React, { useState, useEffect } from 'react';
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
  FaStethoscope,
  FaBars,
  FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';
import { Session } from 'next-auth';
import Image from 'next/image';
import { HospitalIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';

const SideNavbar = ({session}:{session:Session|null}) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
    type MenuItem = {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    color: string;
    };
  const doctormenuItems: MenuItem[]  = [
    { name: 'Dashboard', icon: FaTachometerAlt, path: '/doctors/dashboard', color: 'text-gray-600' },
    { name: 'Appointments', icon: FaCalendarAlt, path: '/doctors/appointments', color: 'text-gray-600' },
    { name: 'Patients', icon: FaUser, path: '/doctors/patients', color: 'text-gray-600' },
    { name: 'Schedule', icon: FaChartBar, path: '/doctors/schedule', color: 'text-gray-600' },
    { name: 'Calendar', icon: FaCalendar, path: '/doctors/calendar', color: 'text-gray-600' },
    { name: 'My Hospital', icon: HospitalIcon, path: '/doctors/my-hospital', color: 'text-gray-600' },

    // { name: 'Notifications', icon: FaBell, path: '/doctors/notifications', color: 'text-gray-600' },
  ];
interface IRoleUser {
    role?: string | null;
}

const hospitalAdminItems: MenuItem[] = [
    { name: 'Dashboard', icon: FaTachometerAlt, path: '/hospitals/dashboard', color: 'text-gray-600' },
    { name: 'Doctors', icon: FaStethoscope, path: '/hospitals/doctors', color: 'text-gray-600' },
    { name: 'Patients', icon: FaUser, path: '/hospitals/patients', color: 'text-gray-600' },
    { name: 'Reports', icon: FaChartBar, path: '/hospitals/reports', color: 'text-gray-600' },
];

const userRole: string | undefined | null = (session?.user as IRoleUser)?.role;

const menuItems: MenuItem[] = [
    ...(userRole === 'DOCTOR' ? doctormenuItems : hospitalAdminItems),
    { name: 'Settings', icon: FaCog, path: '/settings', color: 'text-gray-600' },
];

return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? (
          <FaTimes className="w-5 h-5 text-gray-600" />
        ) : (
          <FaBars className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static top-0 left-0 z-40
          w-64 bg-white h-screen shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Image src="/meditrackdoc.png" alt="alt" width={30} height={30} />
            <span className="text-xl font-semibold text-gray-800">Medilink</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.path;

              return (
                <li key={index}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className={`text-lg transition-colors duration-200 ${
                      isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {session?.user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{session?.user?.name}</p>
              <span className=" text-gray-500 border border-zinc-500 rounded-md bg-gray-50 text-[9px] px-2 py-0.5 truncate">{session?.user?.role}</span>
              <p className="text-sm text-gray-500 truncate">{session?.user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => signOut({
                callbackUrl: '/signin'
              })} className="text-red-400 hover:text-gray-700">
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideNavbar;