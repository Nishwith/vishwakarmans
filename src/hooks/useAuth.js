import { useQuery } from '@tanstack/react-query';
import { getSession, getUser, getUserProfile } from '../services/authService';

/** Current auth session (null when anonymous). */
export const useSession = () =>
  useQuery({
    queryKey: ['auth', 'session'],
    queryFn: getSession,
    staleTime: 5 * 60 * 1000, // 5 min — session rarely changes mid-visit
  });

/** Current auth user object. */
export const useCurrentUser = () =>
  useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getUser,
    staleTime: 5 * 60 * 1000,
  });

/**
 * Public users row for the logged-in user.
 * Disabled when no userId is provided (anonymous).
 */
export const useUserProfile = (userId) =>
  useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
