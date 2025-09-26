import React from 'react';
import SideNavbar from '../components/sidenavbar';

import Settings from '@/app/components/Settings';

const Page = () => {
  return (
    <div className="flex">
      <SideNavbar />
      <div className="flex-1">
        <Settings />
      </div>
    </div>
  );
};

export default Page;
