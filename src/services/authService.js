import { supabase } from './supabaseClient';

/** Get current session (null if anonymous) */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  } catch {
    return null;
  }
};

/** Get current user (null if anonymous) */
export const getUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
};

/** Email + password sign in. Returns { user, session }. */
export const signInWithPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

/** Email + password sign up with metadata. Returns { user, session }. */
export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata, emailRedirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
  return data;
};

/** Google OAuth redirect. */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // This dynamically grabs the current domain (localhost:5173 or your netlify URL)
      redirectTo: `${window.location.origin}/`
    }
  });

  if (error) throw error;
  return data;
};

/** Sign out and clear local state with a hard redirect. */
export const signOut = (queryClient = null, navigate = null, redirectTo = "/login") => {
  // Step 1: Synchronously purge in-memory cache and storage
  if (queryClient) {
    try {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.setQueryData(['auth', 'session'], null);
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.removeQueries({ queryKey: ['users'] });
      queryClient.clear();
    } catch {
      // ignore
    }
  }

  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // ignore
  }

  // Step 2: Set hard browser redirect to wipe in-memory React/DOM state
  if (typeof window !== "undefined") {
    setTimeout(() => {
      window.location.href = redirectTo || '/login';
    }, 100);
  }

  // Step 3: Fire supabase.auth.signOut() last without blocking redirect
  try {
    supabase.auth.signOut().catch((error) => {
      console.warn("Server signout background error:", error);
    });
  } catch (error) {
    console.warn("Server signout dispatch error:", error);
  }
};

export const handleLogout = signOut;

/** Send password reset email. */
export const sendPasswordResetEmail = async (email) => {
  const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://vishwakarmans.netlify.app';
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    // This tells the Supabase server to redirect here after verifying the click
    redirectTo: `${redirectOrigin}/update-password`,
  });

  if (error) throw error;
  return data;
};

/** Update current user's password. */
export const updatePassword = async (password) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};

/** Subscribe to auth state changes. Returns unsubscribe function. */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
};

/** Fetch the public.users row for a given user id. */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

/** Update the public.users row for a given user id. */
export const updateUserProfile = async (userId, updates) => {
  const allowedFields = new Set([
    "full_name",
    "phone",
    "city",
    "location",
    "profile_completed",
  ]);
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    throw new Error("Profile updates must be an object.");
  }
  const forbiddenFields = Object.keys(updates).filter((key) => !allowedFields.has(key));
  if (forbiddenFields.length) {
    throw new Error(`Profile update contains unsupported fields: ${forbiddenFields.join(", ")}`);
  }
  if (!userId) throw new Error("A user ID is required.");

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user || user.id !== userId) {
    throw new Error("Profile updates are limited to the authenticated user.");
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
};
