import React from 'react';
import FeatureCard from './FeatureCard';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface Feature {
    title: string,
    description: string,
    icon: IconDefinition
}

interface FeatureSectionProps {
    features: Feature[]
}

const FeaturesSection: React.FC<FeatureSectionProps> = ({ features }) => (
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