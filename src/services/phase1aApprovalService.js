export const isAtomicApprovalRpcEnabled = () => true;

export async function approveApplicationWithSecureRpc(supabase, applicationId) {
  if (applicationId === null || applicationId === undefined || applicationId === "") {
    throw new Error("A designer application ID is required.");
  }
  const parsedId = Number(applicationId);
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    throw new Error("A valid designer application ID is required.");
  }

  const { data, error } = await supabase.rpc("admin_approve_designer_application", {
    p_application_id: parsedId,
  });
  if (error) throw error;
  if (!data || data.status !== "approved" || !data.designer_id) {
    throw new Error("Approval RPC did not confirm an approved designer profile.");
  }
  return { enabled: true, result: data };
}
