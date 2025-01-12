import FeatureSection from '../../src/components/FeatureSection';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { faCalendarAlt, faCogs, faGift, faUsers } from '@fortawesome/free-solid-svg-icons';

describe('FeatureSection Component', () => {
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
    it('renders feature section with features', () => {
        render(<FeatureSection features={features} />)

        expect(screen.getByText('Browse Clubs')).toBeDefined();
        expect(screen.getByText('Find clubs that match your interests')).toBeDefined();

        expect(screen.getByText('Event Management')).toBeDefined();
        expect(screen.getByText('Stay up-to-date with upcoming club events')).toBeDefined();

        expect(screen.getByText('Member Benefits')).toBeDefined();
        expect(screen.getByText('Access resources and connect with fellow members')).toBeDefined();

        expect(screen.getByText('Create a club')).toBeDefined();
        expect(screen.getByText('Start your own club and manage it easily')).toBeDefined();
    })
})