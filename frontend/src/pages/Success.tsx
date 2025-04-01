import { useState } from "react";
import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";
import { isAuthenticated } from "../utils/auth";

const Success = () => {
  const email = localStorage.getItem("pendingVerificationEmail");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(false);
  const handleResend = async () => {
    setResendError(false);
    setResendSuccess(false);
    if (!email) {
      setResendError(true);
      return;
    }

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/auth/resend-verification`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    if (response.ok) {
      setResendSuccess(true);
    } else {
      setResendError(true);
    }
  };
  const cta = (
    <>
      {isAuthenticated() ? (
        <a
          href="/dashboard"
          className="block px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-center hover:bg-gray-100 w-full md:w-auto"
        >
          Dashboard
        </a>
      ) : (
        <a
          href="/login"
          className="block px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-center hover:bg-gray-100 w-full md:w-auto"
        >
          Login
        </a>
      )}
      <a
        href="/clubs"
        className="block px-4 py-2 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700 w-full md:w-auto"
      >
        Join a Club
      </a>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        brandName="ClubLink"
        links={[
          { label: "Home", href: "/" },
          { label: "Browse Clubs", href: "/clubs" },
          { label: "Browse Events", href: "/events" },
          { label: "About", href: "/about" },
        ]}
        cta={cta}
      />

      <TitleSection title="Signup Successful" subtitle="" />

      <div className="flex-grow flex justify-center items-center px-4 py-12">
        <div className="bg-white border border-green-200 shadow-xl p-8 rounded-xl max-w-xl w-full text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <svg
              className="w-14 h-14 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <p className="text-green-700 text-lg leading-relaxed font-medium">
            Thank you for signing up! 🎉 <br />
            Please check your email for a verification link to activate your
            account.
          </p>

          <p className="text-sm text-gray-500 mt-4">
            If you don’t receive the email, check your spam folder before
            contacting support.
          </p>

          <a
            href={isAuthenticated() ? "/dashboard" : "/login"}
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            {isAuthenticated() ? "Go to Dashboard" : "Login"}
          </a>
          {resendSuccess === false && (
            <p className="text-sm text-gray-500 mt-6">
              Didn’t receive the email?{" "}
              <button
                onClick={handleResend}
                className="text-blue-600 hover:underline font-medium"
              >
                Resend verification email
              </button>
            </p>
          )}
          {resendSuccess && (
            <div className="mt-4 p-3 bg-green-50 border border-green-400 text-green-700 rounded-md text-sm">
              ✅ A new verification email has been sent! Please check your
              inbox.
            </div>
          )}

          {resendError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-400 text-red-700 rounded-md text-sm">
              ⚠️ Failed to resend email. Please try again later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success;
