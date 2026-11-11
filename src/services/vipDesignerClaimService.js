export const isSecureVipClaimRpcEnabled = () =>
  import.meta.env.VITE_PHASE1A_VIP_CLAIM_RPC_ENABLED === "true";

/** The server resolves the verified Auth identity; no email or owner ID is accepted from the browser. */
export async function claimVipDesignerProfile(supabase) {
  if (!isSecureVipClaimRpcEnabled()) return { enabled: false };
  const { data, error } = await supabase.rpc("claim_vip_designer_profile");
  if (error) throw error;
  if (!data || typeof data.claimed !== "boolean") {
    throw new Error("VIP claim RPC returned an invalid response.");
  }
  return { enabled: true, result: data };
}
