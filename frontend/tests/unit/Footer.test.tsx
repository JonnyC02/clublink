import Footer from '../../src/components/Footer';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Footer Component', () => {
    it('Renders footer correctly', () => {
        render(<Footer />)

        expect(screen.getByText('ClubLink')).toBeDefined();
        expect(screen.getByText('Discover and manage your clubs in one place')).toBeDefined();
        expect(screen.getByText('Quick Links')).toBeDefined();
        expect(screen.getByText('About')).toBeDefined();
        expect(screen.getByText('Contact')).toBeDefined();
        expect(screen.getByText('Privacy Policy')).toBeDefined();
        expect(screen.getByText('Stay Updated')).toBeDefined();
        expect(screen.getByText('Subscribe')).toBeDefined();
        expect(screen.getByText('© 2024 Clublink. All rights reserved')).toBeDefined();
    })
})