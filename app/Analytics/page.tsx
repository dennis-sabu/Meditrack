import React from 'react';
import SideNavbar from '../components/sidenavbar';
import Analytics from '../components/analytics';

const page = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNavbar />
      <div className="flex-1 lg:ml-0 ml-0">
        <div className="lg:p-6 p-4 pt-20 lg:pt-6">
          <Analytics />
        </div>
      </div>
    </div>
  );
};

export default page;