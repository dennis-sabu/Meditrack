import React from 'react';
import NavBar from '@/app/components/NavBar';
import Contact from '@/app/components/contact';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-20">
        <Contact />
      </div>
    </div>
  );
};

export default ContactPage;