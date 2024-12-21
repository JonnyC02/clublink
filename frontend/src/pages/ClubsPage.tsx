import Navbar from "../components/Navbar";
import TitleSection from "../components/TitleSection";
import React from "react";

const links = [
    { label: 'Home', href: '/' },
    { label: 'Browse Clubs', href: '/clubs' },
    { label: 'Events', href: '#' },
    { label: 'About', href: '#' }
]

const cta = (
    <>
        <a href="/clubs" className='text-sm text-gray-600 hover:text-gray-900'>Explore Clubs</a>
        <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Get Started</a>
    </>
)

const ClubsPage: React.FC = () => {
    return (
        <div>
            <Navbar brandName='ClubLink' links={links} cta={cta} />
            <TitleSection title="Browse Clubs" subtitle="A directory of all the clubs available to you" />
        </div>
    )
}

export default ClubsPage;