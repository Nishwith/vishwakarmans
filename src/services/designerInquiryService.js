export const isInquiryRpcEnabled = () => true;

/**
 * Submits a new inquiry or reopens an existing one for the authenticated client.
 * Uses the secure server RPC if available, or executes standard Supabase insert.
 *
 * @param {object} supabase - Supabase client instance
 * @param {object} params
 * @param {number|string} params.designerId - Target designer ID
 * @param {string} [params.clientName] - Client contact name
 * @param {string} [params.clientEmail] - Client contact email
 * @param {string} [params.clientPhone] - Client contact phone
 * @param {string} params.message - Inquiry message content
 * @returns {Promise<{action: 'created'|'reopened', connection_id: number, status: string}>}
 */
export async function submitOrReopenInquiry(
  supabase,
  { designerId, clientName, clientEmail, clientPhone, message }
) {
  if (!supabase) throw new Error("Supabase client is required.");

  if (!designerId) throw new Error("A target designer ID is required.");
  const parsedDesignerId = Number(designerId);
  if (!Number.isSafeInteger(parsedDesignerId) || parsedDesignerId <= 0) {
    throw new Error("A valid designer ID is required.");
  }

  const trimmedMessage = typeof message === "string" ? message.trim() : "";
  if (!trimmedMessage) {
    throw new Error("Inquiry message cannot be empty.");
  }

  // Execute RPC if defined on client
  if (typeof supabase.rpc === "function") {
    const { data, error } = await supabase.rpc("submit_or_reopen_designer_inquiry", {
      p_designer_id: parsedDesignerId,
      p_client_name: clientName?.trim() || null,
      p_client_email: clientEmail?.trim() || null,
      p_client_phone: clientPhone?.trim() || null,
      p_message: trimmedMessage,
    });

    if (error) throw error;
    if (data && data.connection_id) {
      return data;
    }
  }

  // Standard Supabase insert into connections table
  let clientId = null;
  try {
    const { data: authData } = (await supabase.auth?.getUser?.()) || {};
    clientId = authData?.user?.id || null;
  } catch {
    // Session lookup fallback
  }

  const { data: inserted, error: insertError } = await supabase
    .from("connections")
    .insert({
      designer_id: parsedDesignerId,
      client_id: clientId,
      client_name: clientName?.trim() || null,
      client_email: clientEmail?.trim() || null,
      client_phone: clientPhone?.trim() || null,
      message: trimmedMessage,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return {
    action: "created",
    connection_id: inserted.id,
    status: inserted.status || "pending",
    data: inserted,
  };
}

/**
 * Archives an inquiry using the secure RPC or direct table update.
 * Preserves history and marks the record as archived.
 */
export async function archiveInquiry(supabase, connectionId) {
  if (!supabase) throw new Error("Supabase client is required.");
  if (!connectionId) throw new Error("A connection ID is required.");

  const parsedId = Number(connectionId);
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    throw new Error("A valid connection ID is required.");
  }

  // Execute RPC if defined on client
  if (typeof supabase.rpc === "function") {
    const { data, error } = await supabase.rpc("designer_archive_connection", {
      p_connection_id: parsedId,
    });

    if (error) throw error;
    if (data && data.status === "archived") {
      return data;
    }
  }

  // Standard table update fallback
  const { data: updated, error: updateError } = await supabase
    .from("connections")
    .update({ status: "archived" })
    .eq("id", parsedId)
    .select()
    .single();

  if (updateError) throw updateError;
  return {
    action: "archived",
    connection_id: parsedId,
    status: "archived",
    data: updated,
  };
}
