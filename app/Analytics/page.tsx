import React from 'react';
import SideNavbar from '../components/sidenavbar';
import Analytics from '../components/analytics';

const page = () => {
  return (
    <div className="flex">
      <SideNavbar />
      <div className="flex-1">
        <Analytics />
      </div>
    </div>
  );
};

export default page;