import { useEffect } from "react";
import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  const links = [
    { label: "Home", href: "/" },
    { label: "Browse Clubs", href: "/clubs" },
    { label: "FAQ", href: "/faq" },
    { label: "About", href: "/about" },
  ];

  const cta = (
    <>
      <a
        href="/login"
        className="block px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-center hover:bg-gray-100 w-full md:w-auto"
      >
        Login
      </a>
      <a
        href="/clubs"
        className="block px-4 py-2 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700 w-full md:w-auto"
      >
        Join a Club
      </a>
    </>
  );

  useEffect(() => {
    localStorage.removeItem("pendingVerificationEmail");

    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar brandName="ClubLink" links={links} cta={cta} />

      <TitleSection title="Logout Successful" subtitle="" />

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
            You have been logged out! 🎉
            <br />
            Redirecting you to the home page!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Logout;
