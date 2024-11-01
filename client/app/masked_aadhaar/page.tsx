"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Spinner from './spinner';

const GenerateMaskedAadhaar: React.FC = () => {
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [captchaChecked, setCaptchaChecked] = useState(false);
    const [captchaLoading, setCaptchaLoading] = useState(false); // New state for captcha loading
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false); // State to manage submit button
    const router = useRouter();

    useEffect(() => {
        const userEmail = Cookies.get('email');
        if (userEmail) {
            setEmail(userEmail);
            setLoading(false);
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleCaptchaVerify = async (checked: boolean) => {
        if (checked) {
            setCaptchaLoading(true); // Start loading
            try {
                const response = await axios.post('http://127.0.0.1:5000/verify-captcha', { captcha_checked: checked });
                if (response.data.status === 'success') {
                    setMessage('CAPTCHA verified successfully!');
                    setIsSubmitEnabled(true); // Enable submit button
                } else {
                    alert('CAPTCHA verification failed! Please check the box.');
                    setIsSubmitEnabled(false); // Disable submit button
                }
            } catch (error) {
                console.error('CAPTCHA verification error:', error);
                alert('Failed to verify CAPTCHA. Please try again.');
                setIsSubmitEnabled(false); // Disable submit button
            } finally {
                setCaptchaLoading(false); // Stop loading
            }
        } else {
            setMessage(null);
            setIsSubmitEnabled(false); // Disable submit button if unchecked
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setCaptchaChecked(isChecked);

        if (isChecked) {
            handleCaptchaVerify(isChecked);
        } else {
            setMessage(null);
            setIsSubmitEnabled(false); // Disable submit button if unchecked
        }
    };

    const generateMaskedAadhaar = async () => {
        if (!isSubmitEnabled) {
            alert('CAPTCHA verification is required!');
            return; // Prevent submission if CAPTCHA is not verified
        }

        try {
            const response = await axios.get(`http://127.0.0.1:5000/generate-aadhaar-card/${email}`);
            if (response.data) {
                if (response.data.error) {
                    setErrorMessage(response.data.error);
                } else {
                    setMessage(`The PDF and image for the masked Aadhaar have been sent to ${email}.`);
                    setErrorMessage(null);
                }
            }
        } catch (error) {
            console.error('Aadhaar generation error:', error);
            setErrorMessage('Failed to generate Aadhaar. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Generate Masked Aadhaar</h2>

                <div className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        checked={captchaChecked}
                        onChange={handleCheckboxChange} // Handle checkbox change
                        className="mr-2"
                    />
                    <label className="text-gray-300 text-sm font-bold">I am not a robot</label>
                    {captchaLoading && <Spinner className="ml-2" />} {/* Show loading spinner */}
                </div>

                <button
                    onClick={generateMaskedAadhaar}
                    className={`w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition duration-300 font-semibold ${!isSubmitEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!isSubmitEnabled}
                >
                    Submit
                </button>

                {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                
                {message && (
                    <div>
                        <p className="text-green-500 text-sm mb-4">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateMaskedAadhaar;
