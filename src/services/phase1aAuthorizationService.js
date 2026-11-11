export const isAdminAuthorizationRpcEnabled = () =>
  import.meta.env.VITE_PHASE1A_ADMIN_AUTH_RPC_ENABLED === "true";

/**
 * Uses the authenticated user's session. Enable only after public.is_admin()
 * has been replaced by the allowlist-backed implementation and verified.
 */
export async function checkServerAdminAuthorization(supabase) {
  if (!isAdminAuthorizationRpcEnabled()) {
    return { enabled: false, authorized: false };
  }
  const { data, error } = await supabase.rpc("is_admin");
  if (error) throw error;
  if (typeof data !== "boolean") {
    throw new Error("Admin authorization RPC returned an invalid response.");
  }
  return { enabled: true, authorized: data };
}

export const isAdminRoleHint = (profile) => profile?.role === "admin";

/**
 * Resolves admin authorization strictly via the allowlist-backed server RPC.
 * Fails closed without falling back to editable users.role.
 */
// eslint-disable-next-line no-unused-vars
export async function resolveAdminAuthorization(supabase, _profile) {
  if (!isAdminAuthorizationRpcEnabled()) {
    // Fail closed: role in users table is account classification, not authorization authority
    return { enabled: false, authorized: false };
  }
  return checkServerAdminAuthorization(supabase);
}
