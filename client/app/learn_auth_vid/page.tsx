"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaShieldAlt } from 'react-icons/fa';
import Image from 'next/image';

const LearnAuthVid: React.FC = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-900 text-white px-4 py-12 md:px-20 lg:px-32">
            {/* Header Section */}
            <header className="text-center mb-12">
                <FaShieldAlt className="text-7xl text-green-500 mx-auto mb-4" />
                <h1 className="text-5xl font-extrabold text-3D52A0 mb-2">
                    Authenticate Virtual ID (VID)
                </h1>
                <p className="text-lg text-gray-300">
                    Securely verify your identity with Virtual ID, a reliable solution that ensures your Aadhaar details are safe.
                </p>
            </header>

            <section className="flex flex-col items-center my-16">
                <button
                    onClick={() => router.push('/auth_vid')}
                    className="bg-green-600 text-white py-3 px-6 rounded font-semibold hover:bg-green-500 transition duration-300"
                >
                    Authenticate Virtual ID Now
                </button>
            </section>

            {/* Benefits & Sample Image Section */}
            <section className="flex flex-col md:flex-row items-center bg-gray-800 p-8 rounded-lg shadow-lg mb-12">
                {/* Benefits */}
                <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
                    <h2 className="text-3xl font-bold text-3D52A0 mb-4">Why Use Virtual ID (VID)?</h2>
                    <ul className="list-disc text-gray-300 space-y-3 pl-5">
                        <li>
                            <span className="font-semibold">Privacy Protection</span>: Your VID conceals your actual Aadhaar number, reducing risks of identity theft and unauthorized access.
                        </li>
                        <li>
                            <span className="font-semibold">Control</span>: Generate and revoke your VID anytime, giving you complete control over your identity verification.
                        </li>
                        <li>
                            <span className="font-semibold">Restricted Access</span>: Only limited information is accessible through VID, ensuring additional data privacy.
                        </li>
                        <li>
                            <span className="font-semibold">Convenience</span>: Easy to use and share as a secure, temporary identifier for Aadhaar-based services.
                        </li>
                    </ul>
                </div>

                {/* Sample Image */}
                <div className="md:w-1/2 flex justify-center">
                    <div className="w-72 bg-gray-700 rounded-lg overflow-hidden">
                        <Image 
                            src="/images/Masked_Aadhaar_example.jpg"
                            alt="Sample VID Authentication"
                            width={288} 
                            height={192} 
                            objectFit="cover" 
                        />
                    </div>
                </div>
            </section>

            {/* Data Protection Section */}
            <section className="bg-gray-800 p-8 rounded-lg shadow-lg mb-12">
                <h2 className="text-3xl font-bold text-3D52A0 mb-4">How We Protect Your Data</h2>
                <p className="text-gray-300 mb-6">
                    Our system uses advanced encryption to secure your VID and associated data. Adhering to strict security protocols, we ensure that only authorized personnel can access your information, keeping it confidential and secure.
                </p>
                <p className="text-gray-300">
                    With VID, you retain full control over your identity verification process, minimizing the risk of unauthorized access.
                </p>
            </section>

            {/* Logo and Call-to-Action Section */}
            <section className="flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-700 mb-8">
                    <Image 
                        src="/images/project_aadhaar_logo.png"
                        alt="Project Aadhaar Logo"
                        layout="fill" 
                        objectFit="cover" 
                        className="rounded-full" 
                    />
                </div>
            </section>
        </div>
    );
};

export default LearnAuthVid;
