"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const OtpPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // New state to track mount
  const router = useRouter();

  const email = Cookies.get("emailForOTP");
  const name = Cookies.get("nameForOTP");
  const dob = Cookies.get("dobForOTP");
  const gender = Cookies.get("genderForOTP");
  const aadhaar = Cookies.get("aadhaarForOTP");
  const password = Cookies.get("passwordForOTP");


  // Effect to set isMounted to true after the component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Effect to check OTP validity on component mount
  useEffect(() => {
    const checkOtp = async () => {
      try {
        const response = await axios.post("http://localhost:5000/check-otp", { email });
        if (response.data.otpExists) {
          setTimeLeft(response.data.remainingTime);
          setIsTimerActive(true);
        } else {
          setError("No OTP available or OTP has expired. Please request a new OTP.");
        }
      } catch (error) {
        setError("Failed to check OTP status. Please try again later.");
      }
    };

    if (email) {
      checkOtp();
    }
  }, [email]);

  // Effect to manage timer
  useEffect(() => {
    if (isTimerActive) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setError("OTP has expired.");
            setIsTimerActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isTimerActive]);

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/verify-otp", {
        email,
        otp,
        name,
        dob,
        gender,
        aadhaar,
        password,
      });
      
      setSuccess("OTP verified successfully! User registered.");
      setError("");

      // Delay before redirecting to the login page
      setTimeout(() => {
        router.push("/login");
      }, 2000); // Wait for 2 seconds before redirecting
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || "Invalid or expired OTP.");
      } else {
        setError("An unexpected error occurred.");
      }
      setSuccess(""); // Clear success message on error
    }
  };

  // Handle OTP resending
  const handleResendOtp = async () => {
    if (timeLeft > 0) {
      setError("You can only resend the OTP after it expires."); // Set error message inline
      return;
    }

    try {
      await axios.post("http://localhost:5000/resend-otp", { email });
      setTimeLeft(300); // Reset timer to 5 minutes
      setIsTimerActive(true); // Start the timer again
      setError("");
      setSuccess("New OTP has been sent to your email."); // Set success message inline
    } catch (error) {
      setError("Failed to resend OTP. Please try again later.");
      setSuccess(""); // Clear success message
    }
  };

  // Format the remaining time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-800">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6">Enter OTP</h2>

        {/* Conditional rendering of the email message */}
        {isMounted && email && (
          <p className="text-green-500 text-sm mb-4">
            An OTP has been sent to your email: {email}
          </p>
        )}

        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none"
              placeholder="Enter the OTP"
            />
          </div>

          {timeLeft > 0 && (
            <p className="text-gray-500 text-sm mb-4">
              Time remaining: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </p>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 font-semibold"
          >
            Verify OTP
          </button>
        </form>

        <button
          onClick={handleResendOtp}
          className="w-full mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 font-semibold"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default OtpPage;
