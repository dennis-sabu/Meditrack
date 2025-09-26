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
    <div className="flex min-h-screen">
      <SideNavbar session={session} />
      <div className="flex flex-1 h-screen overflow-y-scroll flex-col">
        <div className="mb-4 bg-white p-3 w-full flex items-center justify-between">
          <div className="flex items-center w-full justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
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
                  placeholder="Search patients, appointments, notes..."
                  className="w-80 pl-10 pr-3 py-2 rounded-md border border-white/10 bg-white/5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 px-2 py-1 rounded-md bg-white/3">
                        <kbd className="px-1.5 py-0.5 rounded bg-black/20">⌘</kbd>
                        <span className="text-xxs">K</span>
                        <span className="ml-2">Quick commands</span> */}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative p-2 rounded-md hover:bg-white/5"
            >
              <svg
                className="w-6 h-6 text-gray-200"
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

              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">
                3
              </span>
            </button>
          </div>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
