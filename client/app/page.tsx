"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Typed from 'typed.js';
import { FaIdCard, FaShieldAlt ,FaGithub, FaLinkedin} from 'react-icons/fa';

const HomePage: React.FC = () => {
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false); // State for toggling additional content
  const [users, setUsers] = useState<any[]>([]); // State for registered users


  // Configuration for Typed.js
  const options = {
    strings: ["Your identity, our responsibility."],
    typeSpeed: 60,
    backSpeed: 40,
    backDelay: 5000,
    loop: true,
    showCursor: false,  // Disable the cursor
  };
  

  useEffect(() => {
    // Get the logged-in email from cookies
    const email = Cookies.get('email') || null; 
    setLoggedInEmail(email);
    setLoading(false); 

    // Initialize Typed.js
    const typed = new Typed('.motto', options);
    
    // Cleanup on component unmount
    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
      {/* Welcome Section */}
      <div className="w-full h-auto flex flex-col items-center justify-center bg-gray-800 rounded-lg shadow-lg mb-12 py-40 px-6">
        <h1 className="text-6xl font-bold mb-4 text-center">Welcome to HashGuard</h1>
        <p className="text-2xl text-gray-300 mb-2 text-center motto h-8 line-height-8 overflow-hidden"></p>
        <p className="text-lg text-gray-400 mb-4 text-center">
          Empowering you to manage your Aadhaar and VID securely and privately.
        </p>
        {loading ? (
          <p className="text-lg text-gray-300">Loading...</p>
        ) : loggedInEmail ? (
          <p className="text-lg text-green-400">Logged in as: {loggedInEmail}</p>
        ) : (
          <div className="flex space-x-4 mt-4">
            <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-500 transition duration-300">
              Login
            </Link>
            <Link href="/signup" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-500 transition duration-300">
              Signup
            </Link>
          </div>
        )}
      </div>


            {/* Project Overview Section */}
            <div className="w-full p-6 bg-gray-800 rounded-lg shadow-lg mb-12">
        <h2 className="text-4xl font-extrabold mb-4 text-center text-3D52A0">HashGuard’s Project आधार</h2>
        <div className="flex flex-col items-center mb-6 my-10">
          <img src="/images/Project_Aadhaar_Logo.jpg" alt="HashGuard Logo" className="w-80 mb-4" />
          <p className="text-lg text-center text-gray-300 max-w-2xl">
            Our product provides a secure identity management system based on the Aadhaar number, leveraging a Virtual ID (VID) for authentication.
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-2">Brief on Masked Aadhaar Card</h3>
        <p className="text-gray-300 mb-4">
          A masked Aadhaar card is a version of the Aadhaar card where the first eight digits of the Aadhaar number are hidden and a VID is provided instead. Only the last four digits are visible, ensuring a layer of privacy and security.
        </p>

        {showMore && (
          <>
            <h3 className="text-2xl font-semibold mb-2">Uses of Masked Aadhaar Card:</h3>
            <ul className="list-disc list-inside text-gray-300 mb-4">
              <li>Identity Verification: Used for identity verification in various services without exposing the full Aadhaar number.</li>
              <li>KYC Compliance: Helps meet Know Your Customer (KYC) requirements while protecting personal information.</li>
              <li>Secure Transactions: Facilitates secure transactions in banking, mobile services, and online platforms.</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-2">Where is it Useful?</h3>
            <ul className="list-disc list-inside text-gray-300 mb-4">
              <li>Financial Services: Used by banks and financial institutions for identity proof while maintaining customer confidentiality.</li>
              <li>Online Services: E-commerce and online platforms use it for user verification while ensuring data privacy.</li>
              <li>Government Services: Useful for availing government schemes that require Aadhaar authentication.</li>
            </ul>

            <h3 className="text-2xl font-semibold mb-2">Enhanced User Security:</h3>
            <p className="text-gray-300 mb-4">
              By masking the Aadhaar in user-facing views, it ensures only part of the Aadhaar number is visible in case of accidental exposure. This aligns with privacy regulations and follows UIDAI’s masking standards.
            </p>

            <h3 className="text-2xl font-semibold mb-2">Consistency with Official Guidelines:</h3>
            <p className="text-gray-300 mb-4">
              UIDAI recommends masking Aadhaar numbers in digital and physical displays when the full number is not required, following a practice used in banking and secure systems where only partial identifiers are shown.
            </p>

            <h3 className="text-2xl font-semibold mb-2">How It Works:</h3>
            <ol className="list-decimal list-inside text-gray-300 mb-4">
              <li><strong>User Registration:</strong> Users register with their Aadhaar number and email ID. The Aadhaar number is securely stored (hashed/encrypted).</li>
              <li><strong>VID Generation:</strong> Users can generate a unique VID after verifying their identity through an OTP sent to their registered email.</li>
              <li><strong>Aadhaar Image Generation:</strong> An Aadhaar-like image is created, displaying the user’s photo and optional details, along with the masked Aadhaar number.</li>
              <li><strong>Authentication:</strong> Users authenticate using their VID, requiring another OTP verification for added security.</li>
              <li><strong>VID Retrieval/Replacement:</strong> Users can retrieve or replace their VID as needed, again using OTP verification.</li>
              <li><strong>Security Measures:</strong> The system employs post-quantum cryptography for secure data handling and logs all actions for auditing and consent management.</li>
            </ol>

            <h3 className="text-2xl font-semibold mb-2">Benefits of VID:</h3>
            <p className="text-gray-300 mb-4">
              The Virtual ID (VID) provides an additional layer of security, allowing users to authenticate without exposing their actual Aadhaar number. This minimizes the risk of identity theft and ensures that sensitive personal information remains confidential. The VID is easy to generate, can be changed when necessary, and serves as a reliable means of identity verification across various services while adhering to privacy norms.
            </p>
          </>
        )}
        
        <button 
          className="mt-4 text-blue-500 underline"
          onClick={() => setShowMore(!showMore)} // Toggle the visibility of additional content
        >
          {showMore ? 'Read Less' : 'Read More'}
        </button>
      </div>

      {/* Services Section */}
      <div className="w-full p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-3D52A0">Our Services</h2>
        <p className="text-lg text-center text-gray-300 max-w-2xl mb-12 mx-auto">
          We offer a range of services to help you securely handle your Aadhaar and VID information. Explore our services below and take advantage of our secure, user-friendly platform.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Service Card: Masked Aadhaar */}
          <div 
            className="bg-gray-700 rounded-lg shadow-lg p-6 hover:bg-8697C4 transition transform hover:scale-105 cursor-pointer"
            onClick={() => window.location.href = '/learn_masked_aadhaar'}
          >
            <div className="flex items-center justify-center mb-4 text-5xl text-blue-500">
              <FaIdCard />
            </div>
            <h3 className="text-2xl font-semibold text-center mb-2">Generate Masked Aadhaar</h3>
            <p className="text-gray-300 text-center mb-4">
              Generate a masked version of your Aadhaar for enhanced privacy. Masked Aadhaar hides sensitive details, allowing secure sharing.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-500 transition duration-300">
              Learn More
            </button>
          </div>

          {/* Service Card: Authenticate VID */}
          <div 
            className="bg-gray-700 rounded-lg shadow-lg p-6 hover:bg-ADBBD4 transition transform hover:scale-105 cursor-pointer"
            onClick={() => window.location.href = '/auth_vid'}
          >
            <div className="flex items-center justify-center mb-4 text-5xl text-green-500">
              <FaShieldAlt />
            </div>
            <h3 className="text-2xl font-semibold text-center mb-2">Authenticate VID</h3>
            <p className="text-gray-300 text-center mb-4">
              Authenticate your Virtual ID (VID) quickly and securely. Our VID authentication process ensures safe and reliable identity verification.
            </p>
            <button className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-500 transition duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>

{/* Credits Section */}
<div className="w-full p-6 bg-gray-800 rounded-lg shadow-lg mt-12">
  <h2 className="text-4xl font-extrabold mb-6 text-center text-3D52A0">Acknowledgments</h2>
  <p className="text-lg text-center text-gray-300 mb-4">
    We would like to express our gratitude to the following contributors for their invaluable support and expertise in bringing HashGuard to life!
  </p>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
    {/* Contributor Cards */}
    {[
      { name: "John Doe", linkedIn: "https://www.linkedin.com/in/johndoe" },
      { name: "Jane Smith", linkedIn: "https://www.linkedin.com/in/janesmith" },
      { name: "Alice Johnson", linkedIn: "https://www.linkedin.com/in/alicejohnson" },
      { name: "Bob Brown", linkedIn: "https://www.linkedin.com/in/bobbrown" },
    ].map((contributor, index) => (
      <div
        key={index}
        className="bg-gray-700 border border-gray-600 rounded-lg shadow-lg p-4 transition transform hover:scale-105 hover:bg-8697C4 duration-300"
      >
        <div className="flex items-center justify-center space-x-2">
          <h3 className="text-xl font-semibold mb-1 text-white">{contributor.name}</h3>
          <Link href={contributor.linkedIn} target="_blank" className="ml-2">
            <FaLinkedin className="text-blue-500 w-5 h-5 hover:text-blue-600 transition duration-300" />
          </Link>
        </div>
      </div>
    ))}
  </div>
  <div className="mt-6 text-center">
    <p className="text-lg text-gray-300 mb-2">Check out our code on GitHub:</p>
    <Link href="https://github.com/your-repo" target="_blank" className="inline-flex items-center text-blue-400 text-2xl hover:underline hover:text-blue-600 transition duration-300">
      <FaGithub className="w-6 h-6 mr-2" /> GitHub Repository
    </Link>
  </div>
</div>



    </div>
  );
};

export default HomePage;
