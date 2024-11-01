"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const LogoutPage: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const storedEmail = Cookies.get('email');
    setEmail(storedEmail || null); // Set email state
    setLoading(false); // Set loading to false after fetching
  }, []);

  const handleLogout = () => {
    Cookies.remove('email'); // Remove email cookie on logout
    setMessage('Logged out successfully!'); // Set logout success message

    // Redirect to login page after 1 second
    setTimeout(() => {
      router.push('/login'); 
    }, 1000);
  };

  const handleLoginRedirect = () => {
    router.push('/login'); // Redirect to login page
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        {loading ? ( // Check if loading
          <p className="text-white text-center mb-4">Loading...</p>
        ) : email ? (
          <>
            <p className="text-white text-center mb-4">Signed in as: {email}</p>
            <button 
              onClick={handleLogout} 
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500 transition duration-300"
            >
              Logout
            </button>
            {message && <p className="text-green-500 text-sm mt-4 text-center">{message}</p>}
          </>
        ) : (
          <>
            <p className="text-white text-center mb-4">{message || 'Please log in first.'}</p>
            <button onClick={handleLoginRedirect} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition duration-300">
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LogoutPage;
