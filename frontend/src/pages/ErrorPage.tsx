import React from "react";

interface ErrorPageProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ title = "Something Went Wrong!", message = 'An unexpected error occured. Please try again later', onRetry }) => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">{title}</h1>
            <p className="text-lg text-gray-700 mb-6">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200">Retry</button>
            )}
        </div>
    )
}

export default ErrorPage;