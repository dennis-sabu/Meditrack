import React from 'react';
import SideNavbar from '../components/sidenavbar';

const NotificationPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNavbar />
      <div className="flex-1 lg:ml-0 ml-0">
        <div className="pt-16 lg:pt-0 p-6">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-600">You're all caught up! No new notifications at this time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
