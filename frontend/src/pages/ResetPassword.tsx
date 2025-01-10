import React, { useState, useEffect } from 'react';

const ResetPassword: React.FC = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword,
                }),
            });

            if (response.ok) {
                setSuccess('Your password has been successfully reset. You can now log in.');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to reset password. Please try again.');
            }
        } catch (err) {
            console.error('Error resetting password:', err); // eslint-disable-line no-console
            setError('An unexpected error occurred. Please try again later.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Reset Your Password</h2>

                {error && <div className="text-red-600 text-center mb-4">{error}</div>}
                {success && <div className="text-green-600 text-center mb-4">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="Enter your new password"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="Confirm your new password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Reset Password
                    </button>
                </form>

                <p className="text-center mt-4 text-sm">
                    Remember your password? <a href="/login" className="text-blue-500 hover:underline">Login</a>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;