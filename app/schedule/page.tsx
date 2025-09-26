import React from 'react';
import SideNavbar from '../components/sidenavbar';
import ScheduleManagement from '../components/schedule';

const Page = () => {
  return (
    <div className="flex">
      <SideNavbar />
      <div className="flex-1">
        <ScheduleManagement />
      </div>
    </div>
  );
};

export default Page;