import FeatureCard from '../../src/components/FeatureCard';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

describe('FeatureCard Component', () => {
    it('renders the feature card', () => {
        render(<FeatureCard title='Create a club' description='Start your own club and manage it easily' icon={faUsers} />)

        expect(screen.getByText('Create a club')).toBeDefined();
        expect(screen.getByText('Start your own club and manage it easily')).toBeDefined();

        const icon = screen.getByTestId('feature-card-icon');
        expect(icon).toBeDefined();
        expect(icon).toHaveClass('svg-inline--fa');
    });
})