"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthVidDetails: React.FC = () => {
    const router = useRouter();
    const [userDetails, setUserDetails] = useState<{ name: string; dob: string; gender: string } | null>(null);

    useEffect(() => {
        // Retrieve user details from session storage
        const storedDetails = sessionStorage.getItem('userDetails');
        if (storedDetails) {
            setUserDetails(JSON.parse(storedDetails));
            sessionStorage.removeItem('userDetails'); // Clear session storage once data is set
        }
    }, []);

    if (!userDetails) {
        return <p className="text-center text-white">Loading user details...</p>;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white mb-6">User Details</h2>
                <div className="text-white">
                    <p><strong>Name:</strong> {userDetails.name}</p>
                    <p><strong>Date of Birth:</strong> {userDetails.dob}</p>
                    <p><strong>Gender:</strong> {userDetails.gender}</p>
                </div>
                <div className="mt-6 space-y-4">
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition duration-300 font-semibold"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => router.push('/auth_vid')}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 transition duration-300 font-semibold"
                    >
                        Return to Authenticate VID
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthVidDetails;
