"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Spinner from './spinner';

const AuthenticateVID: React.FC = () => {
    const router = useRouter();
    const [vid, setVid] = useState<string>('');
    const [captchaChecked, setCaptchaChecked] = useState(false);
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [vidError, setVidError] = useState<string | null>(null);

    const handleCaptchaVerify = async (checked: boolean) => {
        setCaptchaLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/verify-captcha', { captcha_checked: checked });
            if (response.data.status === 'success') {
                setMessage('CAPTCHA verified successfully!');
                setIsSubmitEnabled(true);
            } else {
                setMessage('CAPTCHA verification failed! Please check the box.');
                setIsSubmitEnabled(false);
            }
        } catch (error) {
            console.error('CAPTCHA verification error:', error);
            setMessage('Failed to verify CAPTCHA. Please try again.');
            setIsSubmitEnabled(false);
        } finally {
            setCaptchaLoading(false);
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
    
        try {
            const response = await axios.post('http://127.0.0.1:5000/authenticate-vid', { vid: vidNumber });
            if (response.data && response.data.user_details) {
                sessionStorage.setItem('userDetails', JSON.stringify(response.data.user_details));
                setErrorMessage(null);
                router.push('/auth_vid_details');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setErrorMessage('Failed to authenticate. Please check the VID and try again.');
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

                <div className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        checked={captchaChecked}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                        aria-label="CAPTCHA verification checkbox"
                    />
                    <label className="text-gray-300 text-sm font-bold">I am not a robot</label>
                    {captchaLoading && <Spinner className="ml-2" />}
                </div>

                <button
                    onClick={authenticateVid}
                    className={`w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition duration-300 font-semibold ${!isSubmitEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!isSubmitEnabled}
                >
                    Submit
                </button>

                {errorMessage && <p className="text-red-500 text-sm mt-4">{errorMessage}</p>}
                
                {message && <p className="text-green-500 text-sm mt-4">{message}</p>}
            </div>
        </div>
    );
};

export default AuthenticateVID;
