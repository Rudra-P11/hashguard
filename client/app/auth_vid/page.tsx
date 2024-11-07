"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AuthenticateVID: React.FC = () => {
    const router = useRouter();
    const [vid, setVid] = useState<string>('');
    const [captchaChecked, setCaptchaChecked] = useState(false);
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [vidError, setVidError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleCaptchaVerify = async (checked: boolean) => {
        setCaptchaLoading(true);
        setIsSubmitEnabled(false); // Disable submit until CAPTCHA is verified
        try {
            const response = await axios.post('https://hashguard-production.up.railway.app/verify-captcha', { captcha_checked: checked });
            setTimeout(() => {
                if (response.data.status === 'success') {
                    setMessage('CAPTCHA verified successfully!');
                    setIsSubmitEnabled(true);
                } else {
                    setMessage('CAPTCHA verification failed! Please check the box.');
                    setIsSubmitEnabled(false);
                }
                setCaptchaLoading(false);
            }, 1000);
        } catch (error) {
            console.error('CAPTCHA verification error:', error);
            setTimeout(() => {
                setMessage('Failed to verify CAPTCHA. Please try again.');
                setIsSubmitEnabled(false);
                setCaptchaLoading(false);
            }, 1000);
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setCaptchaChecked(isChecked);
        setMessage(null);
        setIsSubmitEnabled(false);
        if (isChecked) {
            handleCaptchaVerify(isChecked);
        }
    };

    const validateVid = (value: string) => {
        if (value.length === 16 && /^\d{16}$/.test(value)) {
            setVidError(null);
            return true;
        } else {
            setVidError(value.length > 16 ? "VID must be exactly 16 digits." : "Please enter a valid 16-digit VID.");
            return false;
        }
    };

    const handleVidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
        setVid(value);
        validateVid(value);
    };

    const authenticateVid = async () => {
        if (!isSubmitEnabled) {
            alert('CAPTCHA verification is required!');
            return;
        }
        if (!validateVid(vid)) {
            setErrorMessage('Invalid VID format.');
            return;
        }

        const vidNumber = Number(vid);
        if (isNaN(vidNumber) || vidNumber < 1000000000000000 || vidNumber >= 10000000000000000) {
            setErrorMessage('VID must be a 16-digit positive number.');
            return;
        }

        setLoading(true);
        const spinnerTimeout = setTimeout(() => {
            setLoading(false); // Stop loading after 1 second if the request is still pending
        }, 1000); // 1 second timeout

        try {
            const response = await axios.post('https://hashguard-production.up.railway.app/authenticate-vid', { vid: vidNumber });
            clearTimeout(spinnerTimeout);
            setLoading(false);

            if (response.data && response.data.user_details) {
                sessionStorage.setItem('userDetails', JSON.stringify(response.data.user_details));
                setErrorMessage(null);
                router.push('/auth_vid_details');
            } else {
                setErrorMessage('Authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            clearTimeout(spinnerTimeout);
            setLoading(false);
            setErrorMessage('Authentication failed, no user found. Please check VID and try again.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Authenticate VID</h2>

                <input
                    type="text"
                    value={vid}
                    onChange={handleVidChange}
                    placeholder="Enter your 16-digit VID"
                    className="w-full p-2 mb-1 border rounded-md text-gray-800"
                    maxLength={16}
                    inputMode="numeric"
                    aria-label="Enter your 16-digit VID"
                />
                <p className="text-sm text-gray-400">{vid.length} / 16 characters</p>
                {vidError && <p className="text-red-500 text-sm mb-4">{vidError}</p>}

                <div className="mb-4 flex items-center justify-center bg-gray-700 rounded-md p-3 h-12 my-2">
                    <div className="flex items-center">
                        {captchaLoading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white mr-2"
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
                            <input
                                type="checkbox"
                                checked={captchaChecked}
                                onChange={handleCheckboxChange}
                                className="mr-2 w-5 h-5 accent-blue-500"
                                aria-label="CAPTCHA verification checkbox"
                            />
                        )}
                        <div>
                            <label className="text-gray-300 text-sm font-bold">I am not a robot</label>
                        </div>
                    </div>
                </div>

                {message && (
                    <p className={`text-sm mt-2 ${isSubmitEnabled ? 'text-green-500' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}

                <button
                    onClick={authenticateVid}
                    className={`w-full px-4 py-2 rounded-md font-semibold transition duration-300 ${isSubmitEnabled ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'} text-white`}
                    disabled={!isSubmitEnabled}
                >
                    {loading ? (
                        <svg
                            className="animate-spin h-5 w-5 text-white mx-auto"
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
                        'Submit'
                    )}
                </button>

                {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default AuthenticateVID;