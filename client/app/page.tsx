"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';

const HomePage: React.FC = () => {
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Get the logged-in email from cookies
    const email = Cookies.get('email') || null; // Set to null if undefined
    setLoggedInEmail(email);
    setLoading(false); // Set loading to false after fetching
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to HashGuard</h1>
      {loading ? ( // Check if loading
        <p className="text-lg text-gray-600">Loading...</p>
      ) : loggedInEmail ? (
        <p className="text-lg text-green-600">Logged in as: {loggedInEmail}</p>
      ) : (
        <div className="flex space-x-4 mt-4">
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-300">
            Login
          </Link>
          <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-300">
            Signup
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;
