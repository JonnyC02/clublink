import React from 'react';
import ClubCard from './ClubCard';

interface Club {
    id: number,
    name: string,
    shortdescription: string,
    image: string,
    universitypopularity: number
}

interface ClubsSectionProps {
    clubs: Club[]
}

const ClubsSection: React.FC<ClubsSectionProps> = ({ clubs }) => (
    <section className='bg-white py-16 clubsection'>
        <div className="container mx-auto text-center">
            <h2 className='text-3xl font-semibold mb-8'>Popular Clubs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {clubs.map((club, index) => (
                    <ClubCard key={index} {...club} />
                ))}
            </div>
            <a href='/clubs' className="mt-8 inline-block text-blue-500 hover:underline">See All Clubs &gt;&gt;</a>
        </div>
    </section>
)

export default ClubsSection;