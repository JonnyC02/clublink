import React from 'react';

const Hero: React.FC = () => {
    return (
        <section className='bg-blue-50 py-20'>
            <div className='container mx-auto text-center'>
                <h1 className='text-4xl font-bold text-gray-800'>Discover Your Passion with ClubLink</h1>
                <p className='mt-4 text-gray-600'>Join a community, explore new interests, and grow together.</p>
                <div className="mt-8 flex justify-center space-x-4">
                    <a href='#' className='px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600'>Explore Clubs</a>
                    <a href="#" className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Get Started</a>
                </div>
            </div>
        </section>
    )
}

export default Hero