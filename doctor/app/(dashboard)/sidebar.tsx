'use client';

import React from 'react';
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
  FaStethoscope
} from 'react-icons/fa';
import { Session } from 'next-auth';
import Image from 'next/image';

const SideNavbar = ({session}:{session:Session|null}) => {
  const pathname = usePathname();
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
    { name: 'Reports', icon: FaChartBar, path: '/doctors/reports', color: 'text-gray-600' },
    { name: 'Calendar', icon: FaCalendar, path: '/doctors/calendar', color: 'text-gray-600' },
    { name: 'Notifications', icon: FaBell, path: '/doctors/notifications', color: 'text-gray-600' },
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
    <div className="w-64 bg-white h-screen shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Image src="/meditrackdoc.png" alt="alt" width={30} height={30} />
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
                      ? 'bg-green-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`text-lg ${isActive ? 'text-blue-500' : item.color}   `} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Upgrade Section */}
      {/* <div className="p-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
            <FaUser className="text-white text-2xl" />
          </div>
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors">
            Upgrade Today&apos;s pro
          </button>
        </div>
      </div> */}

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">{session?.user?.name?.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{session?.user?.name}</p>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;