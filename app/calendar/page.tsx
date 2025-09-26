import React from 'react';
import SideNavbar from '../components/sidenavbar';
import Calendar from '../components/calendar';

const page = () => {
  return (
    <div className="flex">
      <SideNavbar />
      <div className="flex-1">
        <Calendar />
      </div>
    </div>
  );
};

export default page;
