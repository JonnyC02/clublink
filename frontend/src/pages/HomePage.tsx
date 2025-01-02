import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeatureSection';
import ClubsSection from '../components/ClubSection';
import Footer from '../components/Footer';
import React from 'react';
import { isAuthenticated } from '../utils/auth';

const links = [
    { label: 'Home', href: '/'},
    { label: 'Browse Clubs', href: '/clubs'},
    { label: 'Events', href: '#'},
    { label: 'About', href: '#'}
]

const cta = (
    <>
        {isAuthenticated() ? (<a href="/dashboard" className='text-sm text-gray-600 hover:text-gray-900'>Dashboard</a>) : (<a href="/login" className='text-sm text-gray-600 hover:text-gray-900'>Login</a>)}
        <a href="/clubs" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Join a Club</a>
    </>
)

const HomePage: React.FC = () => {
    return (
        <div>
        <Navbar brandName='ClubLink' links={links} cta={cta} />
        <Hero />
        <FeaturesSection />
        <ClubsSection />
        <Footer />
      </div>
    )
}

export default HomePage;