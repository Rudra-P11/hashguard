'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    aadhaar: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [passwordWarning, setPasswordWarning] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [aadhaarWarning, setAadhaarWarning] = useState(''); // Aadhaar warning
  const [loading, setLoading] = useState(false); // Loading state

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Password validation
    if (name === 'password') {
      setPasswordWarning(
        value.length < 8 ? 'Password must be at least 8 characters.' : ''
      );
    }

    // Email validation
    if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      setEmailWarning(
        !emailRegex.test(value) ? 'Please enter a valid Gmail address.' : ''
      );
    }

    // Aadhaar validation
    if (name === 'aadhaar') {
      const aadhaarRegex = /^\d{0,12}$/; // Allow only numbers, up to 12 digits
      setAadhaarWarning(
        !aadhaarRegex.test(value)
          ? 'Aadhaar number must be numeric and up to 12 digits.'
          : value.length === 12
          ? ''
          : `Please enter exactly 12 digits. You have filled ${value.length}/12.`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.name) {
      setError('Please provide your name.');
      return;
    }

    if (!formData.dob) {
      setError('Please provide your date of birth.');
      return;
    }

    if (!formData.gender) {
      setError('Please select your gender.');
      return;
    }

    if (!formData.email || emailWarning) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!formData.aadhaar || aadhaarWarning) {
      setError('Please provide a valid Aadhaar number.');
      return;
    }

    setError('');
    setLoading(true); // Set loading to true

    try {
      const response = await axios.post('http://127.0.0.1:5000/register', {
        email: formData.email,
        password: formData.password,
        aadhaar: formData.aadhaar,
        name: formData.name,
        dob: formData.dob,
        gender: formData.gender,
      });

      if (response.status === 201) {
        // Status code for created
        // Store email in cookies for OTP verification
        Cookies.set('emailForOTP', formData.email);
        Cookies.set('aadhaarForOTP', formData.aadhaar);
        Cookies.set('passwordForOTP', formData.password);
        Cookies.set('nameForOTP', formData.name);
        Cookies.set('dobForOTP', formData.dob);
        Cookies.set('genderForOTP', formData.gender);
        router.push('/otp');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      if (axios.isAxiosError(error) && error.response) {
        // Set a generic error message for duplicate entries
        setError('Email or Aadhaar already registered.');
      }
    } finally {
      setLoading(false); // Reset loading state regardless of success or failure
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center py-10"
      style={{ backgroundColor: '#111827' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-lg shadow-lg"
        style={{ backgroundColor: '#1F2937' }}
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          {/* Name Field */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-white text-sm font-bold mb-2"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your name"
            />
            {!formData.name && error && (
              <p className="text-red-500 text-sm mt-1">
                Please fill out this field.
              </p>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="mb-4">
            <label
              htmlFor="dob"
              className="block text-white text-sm font-bold mb-2"
            >
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              id="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Gender Field */}
          <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-white text-sm font-bold mb-2"
            >
              Gender
            </label>
            <select
              name="gender"
              id="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Aadhaar Field */}
          <div className="mb-4">
            <label
              htmlFor="aadhaar"
              className="block text-white text-sm font-bold mb-2"
            >
              Aadhaar Number
            </label>
            <input
              type="text"
              name="aadhaar"
              id="aadhaar"
              value={formData.aadhaar}
              onChange={handleChange}
              required
              maxLength={12} // Limit input to 12 characters
              className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your Aadhaar number"
            />
            <p className="text-gray-500 text-sm mt-1">
              {formData.aadhaar.length}/12
            </p>
            {aadhaarWarning && (
              <p className="text-red-500 text-sm">{aadhaarWarning}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-white text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
            />
            {emailWarning && (
              <p className="text-red-500 text-sm">{emailWarning}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-white text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
            {passwordWarning && (
              <p className="text-red-500 text-sm">{passwordWarning}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-white text-sm font-bold mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm your password"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Submit Button */}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white flex items-center justify-center ${
              loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
            } transition duration-300`}
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
                ></path>
              </svg>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
