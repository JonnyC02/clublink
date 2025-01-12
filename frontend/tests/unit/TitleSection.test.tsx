import TitleSection from '../../src/components/TitleSection'
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Title Section Component', () => {
    it('Render Title Section Correctly', () => {
        render(<TitleSection subtitle='Test Subtitle' title='Test Title' />)

        expect(screen.getByText('Test Title')).toBeDefined()
        expect(screen.getByText('Test Subtitle')).toBeDefined()
    })

    it('Renders cta in Title Section', () => {
        const cta = (
            <>
                <a href="#" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Get Started</a>
                <a href="#" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Join a Club</a>
            </>
        )
        render(<TitleSection subtitle='Test Subtitle' title='Test Title' cta={cta} />)

        expect(screen.getByText('Test Title')).toBeDefined()
        expect(screen.getByText('Test Subtitle')).toBeDefined()
        expect(screen.getByText('Get Started')).toBeDefined()
        expect(screen.getByText('Join a Club')).toBeDefined()
    })
})