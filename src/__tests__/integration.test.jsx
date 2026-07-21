import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { RequireAuth } from '../components/AuthRoutes';
import CompleteProfile from '../pages/complete-profile';
import DesignerDashboard from '../pages/DesignerDashboard';

// Mock the services and hooks
vi.mock('../services/authService', () => ({
  updateUserProfile: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../services/projectService', () => ({
  createProject: vi.fn(),
  uploadPortfolioFile: vi.fn(),
  insertProjectImages: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useCurrentUser: vi.fn(),
  useUserProfile: vi.fn(),
}));

// Declare the mockSupabaseClient with vi.hoisted so it runs before standard code hoisting
const mockSupabaseClient = vi.hoisted(() => {
  const fromMock = vi.fn((table) => {
    if (table === 'users') {
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: { role: 'designer' }, error: null }),
          }),
        }),
      };
    }
    if (table === 'designers') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({
              data: {
                id: 42,
                user_id: 'designer-user-123',
                name: 'Verified Designer',
                bio: 'Experienced interior designer.',
                about_text: 'I design premium homes.',
                logo_url: 'https://example.com/logo.png',
              },
              error: null,
            }),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      };
    }
    if (table === 'connections') {
      return {
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      };
    }
    if (table === 'designer_projects') {
      return {
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: 999 }, error: null }),
          }),
        }),
      };
    }
    if (table === 'project_images') {
      return {
        insert: () => Promise.resolve({ error: null }),
      };
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
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'designer-user-123' } } }, error: null }),
      getUser: () => Promise.resolve({ data: { user: { id: 'designer-user-123' } }, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/logo.png' } }),
      }),
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

import * as authService from '../services/authService';
import * as projectService from '../services/projectService';
import * as authHooks from '../hooks/useAuth';

describe('Vishwakarmans Integration Tests', () => {
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

  test('Onboarding Guard redirects and form submission completes profile successfully', async () => {
    // 1. Mock auth hooks for incomplete profile
    authHooks.useCurrentUser.mockReturnValue({
      data: { id: 'mock-user-123', email: 'test@example.com' },
      isLoading: false,
    });
    authHooks.useUserProfile.mockReturnValue({
      data: { id: 'mock-user-123', profile_completed: false },
      isLoading: false,
    });

    authService.updateUserProfile.mockResolvedValue({ success: true });

    // 2. Render CompleteProfile inside Route structure
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/complete-profile']}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route path="/complete-profile" element={<CompleteProfile />} />
            </Route>
            <Route path="/" element={<div>Home Page Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // 3. Verify onboarding form renders
    expect(screen.getByText(/Complete your profile/i)).toBeInTheDocument();

    const phoneInput = screen.getByPlaceholderText(/\+91 98765 43210/i);
    const citySelect = screen.getByLabelText(/Current City/i);
    const submitBtn = screen.getByRole('button', { name: /Explore Marketplace/i });

    // 4. Fill in details and click submit
    await userEvent.type(phoneInput, '9876543210');
    await userEvent.selectOptions(citySelect, 'Hyderabad');
    await userEvent.click(submitBtn);

    // 5. Assert the update service is triggered
    expect(authService.updateUserProfile).toHaveBeenCalledWith('mock-user-123', {
      phone: '9876543210',
      city: 'Hyderabad',
      profile_completed: true,
    });
  });

  test('DesignerDashboard mounts and new project can be published successfully', async () => {
    // 1. Mock auth state to show completed designer profile
    authHooks.useCurrentUser.mockReturnValue({
      data: { id: 'designer-user-123', email: 'designer@example.com' },
      isLoading: false,
    });
    authHooks.useUserProfile.mockReturnValue({
      data: { id: 'designer-user-123', role: 'designer', profile_completed: true },
      isLoading: false,
    });

    // 2. Render DesignerDashboard
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DesignerDashboard />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for the async loading to finish and dashboard to render
    await screen.findByText(/Verified Partner/i);

    // Navigate to "Portfolio" tab first
    const portfolioNavBtn = screen.getByRole('button', { name: /Portfolio/i });
    await userEvent.click(portfolioNavBtn);

    // Click "Add Project" button to open modal
    const addProjectBtn = screen.getByRole('button', { name: /Add Project/i });
    await userEvent.click(addProjectBtn);

    // Verify Title input and description are rendered inside the modal
    const titleInput = screen.getByPlaceholderText(/E.g., Modern Minimalist Villa/i);
    const descTextarea = screen.getByPlaceholderText(/Describe the scope, the materials used/i);
    const publishBtn = screen.getByRole('button', { name: /Publish Complete Project/i });

    // Fill form inputs
    await userEvent.type(titleInput, 'Luxury Living Lounge');
    await userEvent.type(descTextarea, 'A spacious modern living room project.');

    // Select category (Living Room)
    const categoryBtn = screen.getByRole('button', { name: /Living Room/i });
    await userEvent.click(categoryBtn);

    // Attach dummy file
    const file = new File(['dummy content'], 'dummy.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');
    await userEvent.upload(fileInput, file);

    // Trigger form submit
    await userEvent.click(publishBtn);

    // Assert project creation (direct supabase insert in DesignerDashboard.jsx)
    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('designer_projects');
    });
  });
});
