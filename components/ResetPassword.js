import React from 'react'
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import axios from 'axios';
function ResetPassword() {
    const router = useRouter();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setResetData(prev => ({
                ...prev,
                token: tokenParam
            }));
        }
    }, []);

    // Update the resetData state to include confirmPassword
    const [resetData, setResetData] = useState({
        password: '',
        confirmPassword: ''
    });

    const handleResetChange = (e) => {
        const { name, value } = e.target;
        setResetData({
            ...resetData,
            [name]: value
        });
    };

    // Update the handleResetSubmit function
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Check if passwords match
        if (resetData.password !== resetData.confirmPassword) {
            setNotification({
                type: 'error',
                message: 'Passwords do not match. Please try again.'
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                'https://memis-90605b282646.herokuapp.com/api/password-reset/confirm/',
                {
                    password: resetData.password,
                    token: resetData.token
                }
            );

            setNotification({
                type: 'success',
                message: 'Password reset successful! Redirecting to login page...'
            });

            // Redirect to login page after 5 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
            setResetData({
                password: '',
                confirmPassword: ''
            })
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'An error occurred. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex text-xs">
            <Head>
                <title>Authentication | MEMIS</title>
            </Head>

            <main className="flex w-full">


                <div className="flex flex-col w-full md:w-1/2">
                    <div className="p-5">
                        <div className="text-sm font-semibold text-white">Reset password</div>
                    </div>
                    <div className="flex flex-col justify-center items-center flex-1 p-6">
                        <div className="bg-white rounded-md  w-full max-w-md p-8">
                            {notification.message && (
                                <div className={`mb-4 p-3 rounded text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                    {notification.message}
                                </div>
                            )}

                            <div className="flex justify-center mb-6">
                                <Image
                                    src="/assets/logo.svg"
                                    alt="MEMIS Logo"
                                    width={150}
                                    height={40}
                                />
                            </div>
                            <h1 className="text-xl font-semibold text-center mb-1">Reset Password</h1>
                            <p className="text-center text-gray-600 text-sm mb-6">Please enter your new password.</p>

                            <form onSubmit={handleResetSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            id="new-password"
                                            name="password"
                                            value={resetData.password}
                                            onChange={handleResetChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirm-password"
                                            name="confirmPassword"
                                            value={resetData.confirmPassword}
                                            onChange={handleResetChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-indigo-900 text-white font-semibold rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : "Reset Password"}
                                </button>

                                <Link href={"/login"} className="ml-2 block text-sm text-gray-700 mt-3 text-center justify-center items-center">
                                    Have an account ? Login
                                </Link>
                            </form>
                        </div>
                    </div>
                </div>



                <div className="hidden md:flex md:w-1/2 relative">
                    <Image
                        src="/assets/side-bg.svg"
                        alt="Medical Equipment Background"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-indigo-900 bg-opacity-70 flex flex-col items-center justify-center px-12 text-white">
                        <h2 className="text-2xl font-bold mb-2">Welcome to MEMIS</h2>
                        <p className="text-center mb-6">Effortless. Organized. Reliable.</p>
                        <p className="text-center text-sm">
                            Manage your medical equipment inventory with confidence.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ResetPassword