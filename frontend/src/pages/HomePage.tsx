/* eslint-disable @typescript-eslint/no-explicit-any */
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeatureSection';
import ClubsSection from '../components/ClubSection';
import Footer from '../components/Footer';
import React, { useEffect, useState } from 'react';
import { isAuthenticated } from '../utils/auth';

const links = [
    { label: 'Home', href: '/' },
    { label: 'Browse Clubs', href: '/clubs' },
    { label: 'Events', href: '#' },
    { label: 'About', href: '/about' }
]

const cta = (
    <>
        {isAuthenticated() ? (<a href="/dashboard" className='text-sm text-gray-600 hover:text-gray-900'>Dashboard</a>) : (<a href="/login" className='text-sm text-gray-600 hover:text-gray-900'>Login</a>)}
        <a href="/clubs" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Join a Club</a>
    </>
)

const HomePage: React.FC = () => {
    const [clubs, setClubs] = useState<any[]>([])
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;

            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/clubs`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ longitude, latitude })
                });
                if (response.ok) {
                    const data = await response.json();
                    setClubs(data);
                }
            } catch (err) {
                console.error("Error fetching clubs:", err); // eslint-disable-line no-console
            }
        }, (error) => {
            console.error("Error fetching location:", error); // eslint-disable-line no-console
        });
    }, []);
    return (
        <div>
            <Navbar brandName='ClubLink' links={links} cta={cta} />
            <Hero />
            <FeaturesSection />
            <ClubsSection clubs={clubs} />
            <Footer />
        </div>
    )
}

export default HomePage;