"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaBirthdayCake, FaVenusMars, FaEnvelope, FaIdCard } from 'react-icons/fa';

const AuthVidDetails: React.FC = () => {
    const router = useRouter();
    const [userDetails, setUserDetails] = useState<{ name: string; dob: string; gender: string; email: string; last_digits: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedDetails = sessionStorage.getItem('userDetails');
        if (storedDetails) {
            setUserDetails(JSON.parse(storedDetails));
            sessionStorage.removeItem('userDetails');
        }
    }, []);

    const handleNavigation = (path: string) => {
        if (path === '/auth_vid' && userDetails) {
            const confirmResubmission = window.confirm("Are you sure you want to resubmit the form?");
            if (!confirmResubmission) {
                return; // Do nothing if user cancels
            }
        }

        setLoading(true);
        setTimeout(() => {
            router.push(path);
            setLoading(false);
        }, 1000);
    };

    // Warn user before leaving the page if they have unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (userDetails) {
                const confirmationMessage = "Confirm form resubmission. Return to Authenticate VID page.";
                event.returnValue = confirmationMessage; // Chrome requires returnValue to be set
                return confirmationMessage; // For other browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [userDetails]);

    if (!userDetails) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6">
                <div className="flex flex-col items-center w-full max-w-md bg-gray-800 p-10 rounded-xl shadow-xl text-center space-y-4">
                    <p className="text-gray-300 text-lg font-medium">
                        No authentication requests found.
                    </p>
                    <button
                        onClick={() => handleNavigation('/auth_vid')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-500 transition-all duration-300 font-semibold flex items-center justify-center"
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"></path>
                            </svg>
                        ) : (
                            "Return to Authenticate VID"
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6">
            <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-2xl shadow-2xl space-y-8">
                {/* Profile Image Placeholder */}
                <div className="flex justify-center">
                    <div className="w-48 h-44 bg-gray-700 overflow-hidden">
                        <img src="/images/profile.png" alt="Profile" className="object-cover w-full h-full" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white">User Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-700 p-8 rounded-xl mb-8">
                    <div className="flex items-center space-x-3">
                        <FaUser className="text-2xl text-blue-400" />
                        <div>
                            <p className="text-lg text-gray-300">Name</p>
                            <p className="text-xl text-white font-semibold">{userDetails.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <FaBirthdayCake className="text-2xl text-pink-400" />
                        <div>
                            <p className="text-lg text-gray-300">Date of Birth</p>
                            <p className="text-xl text-white font-semibold">{userDetails.dob}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <FaVenusMars className="text-2xl text-green-400" />
                        <div>
                            <p className="text-lg text-gray-300">Gender</p>
                            <p className="text-xl text-white font-semibold">{userDetails.gender}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <FaEnvelope className="text-2xl text-yellow-400" />
                        <div className="break-all">
                            <p className="text-lg text-gray-300">Email</p>
                            <p className="text-xl text-white font-semibold">{userDetails.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <FaIdCard className="text-2xl text-purple-400" />
                        <div>
                            <p className="text-lg text-gray-300">Masked Aadhaar</p>
                            <p className="text-xl text-white font-semibold">XXXXXXXX{userDetails.last_digits}</p>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-4 justify-center">
                    <button
                        onClick={() => handleNavigation('/')}
                        className="w-full md:w-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-all duration-300 font-semibold flex items-center justify-center"
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"></path>
                            </svg>
                        ) : (
                            "Back to Home"
                        )}
                    </button>
                    <button
                        onClick={() => handleNavigation('/auth_vid')}
                        className="w-full md:w-1/2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-500 transition-all duration-300 font-semibold flex items-center justify-center"
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"></path>
                            </svg>
                        ) : (
                            "Authenticate VID"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthVidDetails;
