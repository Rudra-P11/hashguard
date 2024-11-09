"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import Typed from "typed.js";
import { FaIdCard, FaShieldAlt, FaGithub, FaLinkedin } from "react-icons/fa";

const HomePage: React.FC = () => {
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);

  // Configuration for Typed.js
  const options = {
    strings: ["Your identity, our responsibility."],
    typeSpeed: 60,
    backSpeed: 40,
    backDelay: 5000,
    loop: true,
    showCursor: false, // Disable the cursor
  };

  useEffect(() => {
    const email = Cookies.get("email") || null;
    setLoggedInEmail(email);
    setLoading(false);

    const typed = new Typed(".motto", options);

    return () => {
      typed.destroy();
    };
  }, []);

  const getInitials = (email: string) => {
    const [firstName, lastName] = email.split("@")[0].split(".");
    return `${firstName[0]}${lastName ? lastName[0] : ""}`.toUpperCase();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-900 text-white p-6">
      {/* Welcome Section */}
      <div className="w-full h-auto flex flex-col items-center justify-center bg-cover bg-center rounded-lg shadow-2xl mb-12 py-32 px-6 relative"
        style={{ backgroundImage: "url('/images/background.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-40 rounded-lg"></div>
        <h1 className="text-5xl font-extrabold mb-4 text-center text-white drop-shadow-lg z-10">
          Welcome to HashGuard
        </h1>
        <p className="text-2xl text-gray-300 mb-2 text-center motto h-8 line-height-8 overflow-hidden z-10"></p>
        <p className="text-lg text-gray-400 mb-4 text-center z-10">
          Empowering you to manage your Aadhaar and VID securely and privately.
        </p>
        {loading ? (
          <p className="text-lg text-gray-300">Loading...</p>
        ) : loggedInEmail ? (
          <div className="flex items-center mt-4 z-10">
            {/* Circular Initials Div */}
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-2xl uppercase -mr-3 relative z-10">
              {getInitials(loggedInEmail)}
            </div>
            {/* Rectangular Info Div */}
            <div className="bg-gray-700 py-2 pl-6 pr-4 rounded-lg flex items-center z-10">
              <p className="text-green-400">Signed in as: {loggedInEmail}</p>
            </div>
          </div>
        ) : (
          <div className="flex space-x-4 mt-4 z-10">
            <Link href="/login">
              <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105">
                Login
              </div>
            </Link>
            <Link href="/signup">
              <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-500 transition-all duration-300 transform hover:scale-105">
                Signup
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Project Overview Section */}
      <div className="w-full p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-2xl mb-12">
        <h2 className="text-4xl font-extrabold mb-4 text-center text-blue-400 drop-shadow-lg">
          HashGuard’s Project आधार
        </h2>
        <div className="flex flex-col items-center mb-6">
          <img
            src="/images/Project_Aadhaar_Logo.jpg"
            alt="HashGuard Logo"
            className="w-80 mb-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all"
          />
          <p className="text-lg text-center text-gray-300 max-w-2xl">
            Our product provides a secure identity management system based on
            the Aadhaar number, leveraging a Virtual ID (VID) for authentication.
          </p>
        </div>

        <h3 className="text-2xl font-semibold mb-2">Brief on Masked Aadhaar Card</h3>
        <p className="text-gray-300 mb-4">
          A masked Aadhaar card is a version of the Aadhaar card where the
          first eight digits of the Aadhaar number are hidden and a VID is
          provided instead. Only the last four digits are visible, ensuring a
          layer of privacy and security.
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
              By masking the Aadhaar in user-facing views, it ensures only part
              of the Aadhaar number is visible in case of accidental exposure.
              This aligns with privacy regulations and follows UIDAI’s masking
              standards.
            </p>

            <h3 className="text-2xl font-semibold mb-2">Consistency with Official Guidelines:</h3>
            <p className="text-gray-300 mb-4">
              UIDAI recommends masking Aadhaar numbers in digital and physical
              displays when the full number is not required, following a practice
              used in banking and secure systems where only partial identifiers
              are shown.
            </p>

            <h3 className="text-2xl font-semibold mb-2">How It Works:</h3>
            <p className="text-gray-300 mb-4">
              The user’s Aadhaar number is first validated and then transformed
              into a masked version using UIDAI’s guidelines, where only the
              last four digits are visible. A Virtual ID (VID) is generated, and
              it serves as the primary identifier for use cases that require
              Aadhaar verification.
            </p>
          </>
        )}

        <button
          onClick={() => setShowMore(!showMore)}
          className="text-blue-400 mt-6 hover:underline hover:text-blue-600 transition-all duration-300"
        >
          {showMore ? "Read Less" : "Read More"}
        </button>
      </div>

      {/* Services Section */}
      <div className="w-full p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-2xl">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-400 drop-shadow-lg">
          Our Services
        </h2>
        <p className="text-lg text-center text-gray-300 max-w-2xl mb-12 mx-auto">
          We offer a range of services to help you securely handle your Aadhaar
          and VID information. Explore our services below and take advantage of
          our secure, user-friendly platform.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Service Card: Masked Aadhaar */}
          <div
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-6 hover:bg-indigo-500 transition transform hover:scale-105 cursor-pointer"
            onClick={() => window.location.href = "/learn_masked_aadhaar"}
          >
            <div className="flex items-center justify-center mb-4 text-5xl text-white">
              <FaIdCard />
            </div>
            <h3 className="text-2xl font-semibold text-center mb-2">
              Generate Masked Aadhaar
            </h3>
            <p className="text-gray-300 text-center mb-4">
              Generate a masked version of your Aadhaar for enhanced privacy.
              Masked Aadhaar hides sensitive details, allowing secure sharing.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-500 transition-all duration-300">
              Learn More
            </button>
          </div>

          {/* Service Card: Authenticate VID */}
          <div
            className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 hover:bg-green-500 transition transform hover:scale-105 cursor-pointer"
            onClick={() => window.location.href = "/auth_vid"}
          >
            <div className="flex items-center justify-center mb-4 text-5xl text-white">
              <FaShieldAlt />
            </div>
            <h3 className="text-2xl font-semibold text-center mb-2">Authenticate VID</h3>
            <p className="text-gray-300 text-center mb-4">
              Authenticate your Virtual ID (VID) quickly and securely. Our VID
              authentication process ensures safe and reliable identity
              verification.
            </p>
            <button className="w-full bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-400 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="w-full p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-2xl mt-12 mb-12">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-blue-400 drop-shadow-lg">
          Acknowledgments
        </h2>
        <p className="text-lg text-center text-gray-300 mb-4">
          We would like to express our gratitude to the following contributors
          for their invaluable support and expertise in bringing HashGuard to
          life!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Contributor Cards */}
          {[{ name: "Omkar Lakhute", linkedIn: "https://www.linkedin.com/in/omkar-lakhute-linked-in/" },
            { name: "Rudra Pandya", linkedIn: "https://www.linkedin.com/in/rudrap11/" },
            { name: "Arya Sali", linkedIn: "https://www.linkedin.com/in/arya-sali-13171227a/" },
            { name: "Shreyas Kadge", linkedIn: "https://www.linkedin.com/in/shreyas-kadge-638661265/" }]
            .map((contributor, index) => (
              <a
                key={index}
                href={contributor.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 border border-gray-600 rounded-lg shadow-lg p-4 transition-all transform hover:scale-105 hover:bg-indigo-600 duration-300"
              >
                <div className="flex items-center justify-center space-x-2">
                  <h3 className="text-xl font-semibold mb-1 text-white">
                    {contributor.name}
                  </h3>
                  <FaLinkedin
                    className="text-blue-500 w-5 h-5 hover:text-blue-600 transition-all duration-300"
                    style={{ top: "-2px" }}
                  />
                </div>
              </a>
            ))}
        </div>
        <div className="mt-6 text-center">
          <p className="text-lg text-gray-100 mb-2">Check out our code on GitHub:</p>
          <a
            href="https://github.com/Omkar982004/hashguard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-400 text-2xl hover:underline hover:text-blue-600 transition-all duration-300"
          >
            <FaGithub className="w-6 h-6 mr-2" /> GitHub Repository
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
