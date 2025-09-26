'use client';

import Link from 'next/link';
import { FiCheckCircle, FiHome, FiSettings } from 'react-icons/fi';

interface AuthSuccessProps {
  username: string;
  isNewUser: boolean;
}

export default function AuthSuccess({ username, isNewUser }: AuthSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <FiCheckCircle className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          {isNewUser ? 'Welcome to Medilink!' : 'Welcome back!'}
        </h1>
        <p className="text-green-600 mb-2">
          Hello, <span className="font-semibold">{username}</span>
        </p>
        <p className="text-green-500 text-sm mb-8">
          {isNewUser 
            ? 'Your account has been created successfully.' 
            : 'You have successfully signed in to your account.'
          }
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center"
          >
            <FiHome className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
          
          <Link
            href="/profile"
            className="w-full border border-green-500 text-green-600 py-3 px-4 rounded-lg font-medium hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
          >
            <FiSettings className="w-5 h-5 mr-2" />
            Account Settings
          </Link>
        </div>

        {/* Welcome Message for New Users */}
        {isNewUser && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              🎉 Thank you for joining Medilink! Start by exploring your dashboard and setting up your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}