import React from 'react';
import FeatureCard from './FeatureCard';
import { faCalendarAlt, faCogs, faGift, faUsers } from '@fortawesome/free-solid-svg-icons';

const features = [
    {
        title: 'Browse Clubs',
        description: 'Find clubs that match your interests',
        icon: faCogs
    },
    {
        title: 'Event Management',
        description: 'Stay up-to-date with upcoming club events',
        icon: faCalendarAlt
    },
    {
        title: 'Member Benefits',
        description: 'Access resources and connect with fellow members',
        icon: faGift
    },
    {
        title: 'Create a club',
        description: 'Start your own club and manage it easily',
        icon: faUsers
    }
]

const FeaturesSection: React.FC = () => (
    <section className="py-16 bg-gray-50">
        <div className="container mx-auto text-center">
            <h2 className='text-3xl font-semibold'>Why use ClubLink?</h2>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </div>
    </section>
);

export default FeaturesSection