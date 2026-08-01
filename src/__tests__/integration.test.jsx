import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { RequireAuth } from '../components/AuthRoutes';
import Designers from '../pages/Designers';
import Connect from '../pages/Connect';

// Mock the services and hooks
vi.mock('../services/authService', () => ({
  updateUserProfile: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../services/projectService', () => ({
  fetchConnections: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../hooks/useAuth', () => ({
  useCurrentUser: vi.fn(),
  useUserProfile: vi.fn(),
}));

const mockSupabaseClient = vi.hoisted(() => {
  const mockDesignersData = [
    {
      id: 1,
      name: 'Studio Elite',
      city: 'Hyderabad',
      designer_type: 'interior',
      logo_url: 'https://example.com/logo.png',
      rating_avg: 4.8,
      is_verified: true,
    },
  ];

  const fromMock = vi.fn((table) => {
    if (table === 'designers') {
      const builder = {
        select: () => builder,
        eq: () => builder,
        order: () => builder,
        then: (onfulfilled) => Promise.resolve({ data: mockDesignersData, error: null }).then(onfulfilled),
      };
      return builder;
    }
    if (table === 'connections') {
      const builder = {
        select: () => builder,
        eq: () => builder,
        order: () => builder,
        then: (onfulfilled) => Promise.resolve({ data: [], error: null }).then(onfulfilled),
      };
      return builder;
    }
    return {
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    };
  });

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'client-user-123' } } }, error: null }),
      getUser: () => Promise.resolve({ data: { user: { id: 'client-user-123' } }, error: null }),
    },
    from: fromMock,
  };
});

vi.mock('../supabaseClient', () => ({
  supabase: mockSupabaseClient,
}));

vi.mock('../services/supabaseClient', () => ({
  supabase: mockSupabaseClient,
}));

import * as authHooks from '../hooks/useAuth';

describe('Vishwakarmans Client B2C Application Integration Tests', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  test('RequireAuth protects private client routes and redirects unauthenticated users to login', async () => {
    authHooks.useCurrentUser.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/connect']}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route path="/connect" element={<Connect />} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
  });

  test('Designers marketplace mounts and displays verified designer cards', async () => {
    authHooks.useCurrentUser.mockReturnValue({
      data: { id: 'client-user-123', email: 'client@example.com' },
      isLoading: false,
    });
    authHooks.useUserProfile.mockReturnValue({
      data: { id: 'client-user-123', role: 'client', profile_completed: true },
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Designers />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByText(/Studio Elite/i);
    expect(screen.getByText(/Studio Elite/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hyderabad/i).length).toBeGreaterThan(0);
  });
});
