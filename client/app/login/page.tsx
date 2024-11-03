"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [emailWarning, setEmailWarning] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldWarnings, setFieldWarnings] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loggedInEmail = Cookies.get('email');
    if (loggedInEmail) {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'email') {
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      setEmailWarning(gmailRegex.test(value) ? '' : 'Please enter a valid Gmail address');
      setFieldWarnings({ ...fieldWarnings, email: value ? '' : 'This field is required.' });
    } else {
      setFieldWarnings({ ...fieldWarnings, [name]: value ? '' : 'This field is required.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password || emailWarning) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        Cookies.set('email', formData.email);
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          setSuccessMessage('');
          router.push('/');
        }, 1000);
      } else {
        setErrorMessage(data.error || 'Invalid login credentials.');
      }
    } catch {
      setErrorMessage('An error occurred during login. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C6.477 0 0 6.477 0 12h4zm2 5.291A7.964 7.964 0 014 12H0c0 2.137.837 4.161 2.196 5.659l1.804-1.368z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-600 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Gmail address"
            />
            {emailWarning && <p className="text-red-500 text-sm mt-1">{emailWarning}</p>}
            {fieldWarnings.email && <p className="text-red-500 text-sm mt-1">{fieldWarnings.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-600 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            {fieldWarnings.password && <p className="text-red-500 text-sm mt-1">{fieldWarnings.password}</p>}
          </div>

          {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

          <button
            type="submit"
            className={`w-full flex items-center justify-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-md transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C6.477 0 0 6.477 0 12h4zm2 5.291A7.964 7.964 0 014 12H0c0 2.137.837 4.161 2.196 5.659l1.804-1.368z"
                ></path>
              </svg>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
