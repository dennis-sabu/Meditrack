import { getServerAuthSession } from "@/server/auth";
import { ReactNode } from "react";
import SideNavbar from "./sidebar";

export default async function DoctorsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerAuthSession();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNavbar session={session} />
      <div className="flex flex-1 h-screen overflow-hidden flex-col md:ml-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 w-full flex items-center justify-between shadow-sm">
          <div className="flex items-center w-full justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Mobile: Leave space for hamburger menu */}
              <div className="md:hidden w-10"></div>

              <div className="relative flex-1 max-w-md">
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                <input
                  type="search"
                  name="search"
                  placeholder="Search patients, appointments..."
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Notifications"
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
              >
                <svg
                  className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors duration-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full animate-pulse">
                  3
                </span>
              </button>

              {/* User Avatar - Mobile friendly */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-xs md:text-sm">
                    {session?.user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-32">
                    {session?.user?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
