import React from 'react';
import SideNavbar from '../components/sidenavbar';
import ScheduleManagement from '../components/schedule';

const Page = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNavbar />
      <div className="flex-1 lg:ml-0 ml-0">
        <div className="pt-16 lg:pt-0">
          <ScheduleManagement />
        </div>
      </div>
    </div>
  );
};

export default Page;