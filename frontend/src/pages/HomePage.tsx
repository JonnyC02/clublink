import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturesSection from "../components/FeatureSection";
import ClubsSection from "../components/ClubSection";
import Footer from "../components/Footer";
import React, { useEffect, useState } from "react";
import { isAuthenticated } from "../utils/auth";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faCalendarAlt,
  faCogs,
  faGift,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const links = [
  { label: "Home", href: "/" },
  { label: "Browse Clubs", href: "/clubs" },
  { label: "About", href: "/about" },
];

const features = [
  {
    title: "Browse Clubs",
    description: "Find clubs that match your interests",
    icon: faCogs as IconProp,
  },
  {
    title: "Event Management",
    description: "Stay up-to-date with upcoming club events",
    icon: faCalendarAlt as IconProp,
  },
  {
    title: "Member Benefits",
    description: "Access resources and connect with fellow members",
    icon: faGift as IconProp,
  },
  {
    title: "Create a club",
    description: "Start your own club and manage it easily",
    icon: faUser as IconProp,
  },
];

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

const HomePage: React.FC = () => {
  const [clubs, setClubs] = useState<[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchClubs = async (latitude?: number, longitude?: number) => {
      try {
        const body =
          latitude && longitude
            ? { latitude, longitude, limit: 3 }
            : { limit: 3 };

        const response = await fetch(`${process.env.REACT_APP_API_URL}/clubs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          setClubs(data);
        }
      } catch (err) {
        console.error("Error fetching clubs:", err); // eslint-disable-line no-console
      } finally {
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchClubs(latitude, longitude);
      },
      (error) => {
        console.log("permission denied, using default fallback.", error); // eslint-disable-line no-console
        fetchClubs();
      }
    );
  }, []);

  return (
    <div>
      <Navbar brandName="ClubLink" links={links} cta={cta} />
      <Hero />
      <FeaturesSection features={features} />
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
          <p className="ml-4 text-blue-500">Loading Clubs...</p>
        </div>
      ) : (
        <ClubsSection clubs={clubs} />
      )}
      <Footer />
    </div>
  );
};

export default HomePage;
