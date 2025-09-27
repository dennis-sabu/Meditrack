'use client'
import { FaKitMedical, FaNotesMedical } from "react-icons/fa6";
import Navbar from "../components/NavBar";
import { FaCalendar } from "react-icons/fa";
import { FiLayout } from "react-icons/fi";
import { signOut } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex max-w-6xl w-full mx-auto mt-[100px]">
        <aside className="w-1/4 p-3 border-r">
            <div className="flex flex-col h-full space-y-4">
                {/* <div className="px-2 py-3">
                    <h2 className="text-lg font-semibold">MedTrack</h2>
                    <p className="text-sm text-gray-500">Dashboard</p>
                </div> */}

                {/*
                  Sidebar items driven by JSON-like array.
                  Each item includes a simple inline SVG icon.
                */}
                <nav className="flex flex-col gap-1 px-1">
                    {[
                        {
                            key: "dashboard",
                            name: "Dashboard",
                            href: "/dashboard",
                            icon: (
                               <FiLayout size={25} className="text-zinc-400" />
                            ),
                        },
                        {
                            key: "appointments",
                            name: "Appointments",
                            href: "/appointments",
                            icon: (
                                <FaCalendar size={25} className="text-zinc-400" />
                            ),
                        },
                        {
                            key: "medicines",
                            name: "My Medicines",
                            href: "#",
                            icon: (
                                <FaNotesMedical size={25} className="text-zinc-400" />
                            ),
                        },
                    ].map((item) => (
                        <a
                            key={item.key}
                            href={item.href}
                            className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
                        >
                            <span className="mr-3 flex-none">{item.icon}</span>
                            <span className="text-md">{item.name}</span>
                        </a>
                    ))}
                </nav>

                <div className="mt-auto px-2 py-3">
                    <button onClick={()=>{
                        signOut({
                            callbackUrl: '/signin'
                        })
                    }} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100">
                        Sign out
                    </button>
                </div>
            </div>
        </aside>
        <div className="p-3 flex-1 overflow-y-scroll max-h-screen">{children}</div>
      </main>
    </div>
  );
}
