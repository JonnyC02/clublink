import React from 'react';
import Hero from '../../src/components/Hero'
import { render, screen } from '@testing-library/react';

describe('Hero Component', () => {
    it('Renders Hero Correctly', () => {
        render(<Hero />)

        expect(screen.getByText('Discover Your Passion with ClubLink')).toBeDefined();
        expect(screen.getByText('Join a community, explore new interests, and grow together.')).toBeDefined();

        expect(screen.getByText('Explore Clubs')).toBeDefined();
        expect(screen.getByText('Get Started')).toBeDefined();
    })
})