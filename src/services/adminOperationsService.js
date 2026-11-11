export const isAdminOperationsRpcEnabled = () => true;

/**
 * Verifies a designer profile using the authenticated admin RPC.
 * Fails closed without falling back to direct table mutations.
 */
export async function verifyDesignerWithSecureRpc(supabase, designerId) {
  if (!supabase) throw new Error("Supabase client is required.");
  if (!designerId) throw new Error("A designer ID is required.");

  const parsedId = Number(designerId);
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    throw new Error("A valid designer ID is required.");
  }

  const { data, error } = await supabase.rpc("admin_verify_designer", {
    p_designer_id: parsedId,
  });

  if (error) throw error;
  if (!data || data.is_verified !== true) {
    throw new Error("Verification RPC did not confirm the verified status.");
  }
  return data;
}

/**
 * Rejects a designer application using the authenticated admin RPC.
 * Fails closed without falling back to direct table mutations.
 */
export async function rejectApplicationWithSecureRpc(supabase, applicationId, reason = null) {
  if (!supabase) throw new Error("Supabase client is required.");
  if (!applicationId) throw new Error("An application ID is required.");

  const parsedId = Number(applicationId);
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    throw new Error("A valid application ID is required.");
  }

  const { data, error } = await supabase.rpc("admin_reject_designer_application", {
    p_application_id: parsedId,
    p_rejection_reason: reason?.trim() || null,
  });

  if (error) throw error;
  if (!data || data.status !== "rejected") {
    throw new Error("Rejection RPC did not confirm the rejected status.");
  }
  return data;
}

/**
 * Updates a contact message status using the authenticated admin RPC.
 */
export async function updateContactMessageStatusWithSecureRpc(supabase, messageId, status) {
  if (!supabase) throw new Error("Supabase client is required.");
  if (!messageId) throw new Error("A message ID is required.");

  const parsedId = Number(messageId);
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    throw new Error("A valid message ID is required.");
  }

  const trimmedStatus = typeof status === "string" ? status.trim() : "";
  if (!trimmedStatus) throw new Error("Status cannot be empty.");

  const { data, error } = await supabase.rpc("admin_update_contact_message_status", {
    p_message_id: parsedId,
    p_status: trimmedStatus,
  });

  if (error) throw error;
  return data;
}

/**
 * Deletes a contact message using the authenticated admin RPC.
 */
export async function deleteContactMessageWithSecureRpc(supabase, messageId) {
  if (!supabase) throw new Error("Supabase client is required.");
  if (!messageId) throw new Error("A message ID is required.");

  const parsedId = Number(messageId);
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    throw new Error("A valid message ID is required.");
  }

  const { data, error } = await supabase.rpc("admin_delete_contact_message", {
    p_message_id: parsedId,
  });

  if (error) throw error;
  return data;
}

