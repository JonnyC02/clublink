import React from 'react';
import ClubCard from './ClubCard';

const clubs = [
    {
        image: 'path-to-image',
        name: 'QUB Fencing Club',
        description: 'Olympic Fencing @ QUB',
        members: [1, 1, 1, 1]
    },
    {
        image: 'path-to-image',
        name: 'Queen\'s Computing Society',
        description: 'Big Nerd Society',
        members: [1, 1, 1]
    },
    {
        image: 'path-to-image',
        name: 'Queen\'s Medical Society',
        description: 'Dcotors of Queens',
        members: [1, 1, 1]
    }
]

const ClubsSection: React.FC = () => (
    <section className='bg-white py-16'>
        <div className="container mx-auto text-center">
            <h2 className='text-3xl font-semibold mb-8'>Popular Clubs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {clubs.map((club, index) => (
                    <ClubCard key={index} {...club} />
                ))}
            </div>
            <a href='/clubs' className="mt-8 inline-block text-blue-500 hover:underline">See All Clubs</a>
        </div>
    </section>
)

export default ClubsSection;