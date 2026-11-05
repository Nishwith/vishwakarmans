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
    rpc: vi.fn((fnName) => {
      if (fnName === 'get_designers_nearby') {
        return Promise.resolve({
          data: [
            {
              id: 99,
              name: 'Nearby Artisan Studio',
              city: 'Secunderabad',
              designer_type: 'interior',
              logo_url: 'https://example.com/artisan.png',
              rating_avg: 4.9,
              is_verified: true,
            },
          ],
          error: null,
        });
      }
      return Promise.resolve({ data: [], error: null });
    }),
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
    expect(screen.getByText(/Find Designers Near Me/i)).toBeInTheDocument();
  });

  test('Find Designers Near Me invokes Geolocation and get_designers_nearby RPC, then clears filter', async () => {
    authHooks.useCurrentUser.mockReturnValue({
      data: { id: 'client-user-123', email: 'client@example.com' },
      isLoading: false,
    });
    authHooks.useUserProfile.mockReturnValue({
      data: { id: 'client-user-123', role: 'client', profile_completed: true },
      isLoading: false,
    });

    // Mock navigator.geolocation
    const getCurrentPositionMock = vi.fn((success) => {
      success({
        coords: {
          latitude: 17.3850,
          longitude: 78.4867,
        },
      });
    });
    vi.stubGlobal('navigator', {
      ...globalThis.navigator,
      geolocation: {
        getCurrentPosition: getCurrentPositionMock,
      },
    });

    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Designers />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await screen.findByText(/Studio Elite/i);

    const nearMeBtn = screen.getByRole('button', { name: /Find Designers Near Me/i });
    await user.click(nearMeBtn);

    expect(getCurrentPositionMock).toHaveBeenCalled();
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_designers_nearby', {
      user_lat: 17.3850,
      user_lng: 78.4867,
      radius_meters: 50000,
    });

    // Verify nearby designer is rendered
    await screen.findByText(/Nearby Artisan Studio/i);
    expect(screen.getByText(/Nearby Artisan Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear Filter/i)).toBeInTheDocument();

    // Click Clear Filter
    const clearBtn = screen.getByRole('button', { name: /Clear Filter/i });
    await user.click(clearBtn);

    // Default designer restored
    await screen.findByText(/Studio Elite/i);
    expect(screen.getByText(/Studio Elite/i)).toBeInTheDocument();
  });

  test('OnboardingGuard redirects user with incomplete profile to /complete-profile', async () => {
    const { OnboardingGuard } = await import('../components/AuthRoutes');
    authHooks.useCurrentUser.mockReturnValue({
      data: { id: 'client-user-123', email: 'client@example.com' },
      isLoading: false,
    });
    authHooks.useUserProfile.mockReturnValue({
      data: { id: 'client-user-123', role: 'client', profile_completed: false, phone: null },
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/connect']}>
          <OnboardingGuard>
            <Routes>
              <Route path="/connect" element={<div>Connect Page</div>} />
              <Route path="/complete-profile" element={<div>Complete Profile Page</div>} />
            </Routes>
          </OnboardingGuard>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Complete Profile Page/i)).toBeInTheDocument();
  });
});
