"use client";
import { Hospital } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode, useState } from "react";
import {
  FiClipboard,
  FiHome,
  FiMenu,
  FiSettings,
  FiUser,
  FiX,
} from "react-icons/fi";

const Sidebar = ({
  user,
  children,
}: {
  user: Session | null;
  children: ReactNode;
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <FiHome /> },
    { name: "Hospitals", href: "/admin/manage-hospitals", icon: <Hospital /> },
    { name: "Doctors", href: "/admin/manage-doctors", icon: <FiUser /> },
    { name: "Reports", href: "/admin/reports", icon: <FiClipboard /> },
    { name: "Settings", href: "/admin/settings", icon: <FiSettings /> },
  ];
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed z-20 inset-y-0 left-0 w-64 bg-white border-r shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b md:hidden">
          <Image src={"/meditrackdoc.png"} alt="" width={80} height={80} />
          <span className="text-xl font-bold text-blue-600">MedAdmin</span>
          <button
            className="text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="hidden md:flex items-center justify-center h-16 border-b">
          <Image src={"/meditrackdoc.png"} alt="" width={40} height={40} />

          <span className="text-xl font-bold ms-5 text-blue-600">MedAdmin</span>
        </div>

        <nav className="mt-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              <span className="mr-3 text-lg">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="flex items-center justify-between bg-white h-16 px-4 border-b shadow-sm">
          <button
            className="text-gray-700 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            Super Admin Panel
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user?.user.name}</span>
            <details className="relative">
              <summary className="flex items-center space-x-3 list-none cursor-pointer">
                <Image
                  src={user?.user.image ?? "/meditrackdoc.png"}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <svg
                  className="w-4 h-4 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>

              <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                <button
                onClick={()=>signOut()}
                  type="submit"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </details>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        {/* Page Content */}
      </div>
      {/* Main Content */}
    </>
  );
};

export default Sidebar;
