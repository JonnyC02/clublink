import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { isAuthenticated } from '../../src/utils/auth';

jest.mock('../../src/utils/auth', () => ({
  isAuthenticated: jest.fn(),
}));

describe('ProtectedRoute Component', () => {
  it('renders children when user is authenticated', () => {
    (isAuthenticated as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeDefined();
  });

  it('redirects to /login when user is not authenticated', () => {
    (isAuthenticated as jest.Mock).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeDefined();
  });
});