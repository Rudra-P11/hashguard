"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaIdCard, FaShieldAlt } from 'react-icons/fa';

const Services: React.FC = () => {
    const router = useRouter();

    const navigateTo = (path: string) => {
        router.push(path);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12 px-4">
            <h2 className="text-4xl font-extrabold mb-8 text-center text-3D52A0">
                Our Services
            </h2>
            <p className="text-lg text-center text-gray-300 max-w-2xl mb-12">
                We offer a range of services to help you securely handle your Aadhaar and VID information. Explore our services below and take advantage of our secure, user-friendly platform.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Service Card: Masked Aadhaar */}
                <div 
                    className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-8697C4 transition transform hover:scale-105"
                    onClick={() => navigateTo('/learn_masked_aadhaar')}
                >
                    <div className="flex items-center justify-center mb-4 text-4xl text-blue-500">
                        <FaIdCard />
                    </div>
                    <h3 className="text-2xl font-semibold text-center mb-2 text-white">
                        Generate Masked Aadhaar
                    </h3>
                    <p className="text-gray-300 text-center mb-4">
                        Generate a masked version of your Aadhaar for enhanced privacy. Masked Aadhaar hides sensitive details, allowing secure sharing.
                    </p>
                    <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-500 transition duration-300">
                        Learn More
                    </button>
                </div>

                {/* Service Card: Authenticate VID */}
                <div 
                    className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-ADBBD4 transition transform hover:scale-105"
                    onClick={() => navigateTo('/auth_vid')}
                >
                    <div className="flex items-center justify-center mb-4 text-4xl text-green-500">
                        <FaShieldAlt />
                    </div>
                    <h3 className="text-2xl font-semibold text-center mb-2 text-white">
                        Authenticate VID
                    </h3>
                    <p className="text-gray-300 text-center mb-4">
                        Authenticate your Virtual ID (VID) quickly and securely. Our VID authentication process ensures safe and reliable identity verification.
                    </p>
                    <button className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-500 transition duration-300">
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Services;
