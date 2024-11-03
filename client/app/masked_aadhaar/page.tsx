"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const GenerateMaskedAadhaar: React.FC = () => {
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [captchaChecked, setCaptchaChecked] = useState(false);
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [pdfSent, setPdfSent] = useState(false); // Track PDF sent status
    const router = useRouter();

    useEffect(() => {
        const userEmail = Cookies.get('email');
        if (userEmail) {
            setEmail(userEmail);
        } else {
            router.push('/login');
        }
        setLoading(false);
    }, [router]);

    const handleCaptchaVerify = async (checked: boolean) => {
        if (checked) {
            setCaptchaLoading(true);
            try {
                const response = await axios.post('http://127.0.0.1:5000/verify-captcha', { captcha_checked: checked });
                setIsSubmitEnabled(response.data.status === 'success');
            } catch (error) {
                console.error('CAPTCHA verification error:', error);
                alert('Failed to verify CAPTCHA. Please try again.');
                setIsSubmitEnabled(false);
            } finally {
                setCaptchaLoading(false);
            }
        } else {
            setIsSubmitEnabled(false);
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setCaptchaChecked(isChecked);

        if (isChecked) {
            setCaptchaLoading(true);
            setTimeout(() => {
                handleCaptchaVerify(isChecked);
                setCaptchaLoading(false);
            }, 1000); // Show spinner for 1 second
        } else {
            setIsSubmitEnabled(false);
        }
    };

    const generateMaskedAadhaar = async () => {
        if (!isSubmitEnabled) {
            alert('CAPTCHA verification is required!');
            return;
        }

        setSubmitLoading(true);

        try {
            const response = await axios.get(`http://127.0.0.1:5000/generate-aadhaar-card/${email}`);
            
            if (response.data) {
                setErrorMessage(response.data.error || null);
                setPdfSent(!response.data.error);
            }
        } catch (error) {
            console.error('Aadhaar generation error:', error);
            setErrorMessage('Failed to generate Aadhaar. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Display loading spinner when page or submit is loading
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <p>Loading...</p>
            </div>
        );
    }

    if (submitLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="flex flex-col items-center">
                    <svg
                        className="animate-spin h-5 w-5 text-white mb-4"
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
                    <p>Wait, sending PDF to your email...</p>
                </div>
            </div>
        );
    }

    if (pdfSent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <h2 className="text-3xl font-bold mb-4">PDF Sent Successfully!</h2>
                <p className="text-lg mb-8">The PDF and image for the masked Aadhaar have been sent to your registered email.</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Generate Masked Aadhaar</h2>

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
                        <label className="text-gray-300 text-sm font-bold">I am not a robot</label>
                    </div>
                </div>

                {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

                <button
                    onClick={generateMaskedAadhaar}
                    className={`w-full px-4 py-2 rounded-md font-semibold transition duration-300 ${isSubmitEnabled ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'} text-white flex items-center justify-center`}
                    disabled={!isSubmitEnabled || submitLoading}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default GenerateMaskedAadhaar;
