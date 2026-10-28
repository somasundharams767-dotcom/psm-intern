import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { StatusBadge } from './components/StatusBadge';
import { App } from './App';

describe('PSM.Intern Frontend Suite', () => {
  it('renders landing page with headline and tagline', () => {
    render(<App />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(/Verify Your Internship\./i);
    expect(h1).toHaveTextContent(/Showcase Your Skills\./i);
  });

  it('renders status badges with correct styling and labels', () => {
    const { rerender } = render(<StatusBadge status="issued" />);
    expect(screen.getByText(/Verified • Issued/i)).toBeInTheDocument();

    rerender(<StatusBadge status="revoked" />);
    expect(screen.getByText(/Revoked/i)).toBeInTheDocument();

    rerender(<StatusBadge status="pending" />);
    expect(screen.getByText(/Pending Review/i)).toBeInTheDocument();

    rerender(<StatusBadge status="approved" />);
    expect(screen.getByText(/Approved/i)).toBeInTheDocument();
  });

  it('renders quick action buttons on landing page', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Verify Now/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Student Portal/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Company Administrator/i })[0]).toBeInTheDocument();
  });

  it('renders status badges for all states including rejected', () => {
    const { rerender } = render(<StatusBadge status="rejected" />);
    expect(screen.getByText(/^Rejected$/i)).toBeInTheDocument();
  });
});
