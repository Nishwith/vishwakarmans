const describeSupabaseError = (error) => {
  if (!error) return "";
  return [error.message, error.code && `code ${error.code}`, error.details, error.hint]
    .filter(Boolean)
    .join(" — ");
};

const actionError = (action, table, id, error, policyAction = "UPDATE") => {
  const detail = describeSupabaseError(error);
  const rlsHint = error?.code === "42501"
    ? ` Check the authenticated admin's table ${policyAction} policy.`
    : "";
  return new Error(
    `${action} failed for ${table} row ${id}.${detail ? ` ${detail}.` : ""}${rlsHint}`,
    { cause: error }
  );
};

export const requireExactlyOneUpdatedRow = (data, error, { action, table, id }) => {
  if (error) throw actionError(action, table, id, error);
  if (!Array.isArray(data)) {
    throw new Error(`${action} failed for ${table} row ${id}: unexpected update response.`);
  }
  if (data.length === 0) {
    throw new Error(
      `${action} failed for ${table} row ${id}: no row was updated. The row may be missing, no longer visible, or blocked by Row Level Security.`
    );
  }
  if (data.length > 1) {
    throw new Error(
      `${action} failed for ${table} row ${id}: ${data.length} rows were updated; exactly one was expected.`
    );
  }
  return data[0];
};

export const onboardDesignerApplication = async (supabase, application) => {
  const applicationId = application?.id;
  if (applicationId === null || applicationId === undefined || applicationId === "") {
    throw new Error("Cannot approve this application because its database ID is missing.");
  }

  const applicationRead = await supabase
    .from("designer_applications")
    .select("id, user_id, org_name, city, email, phone, designer_type, status")
    .eq("id", applicationId)
    .maybeSingle();
  if (applicationRead.error) {
    throw actionError("Application lookup", "designer_applications", applicationId, applicationRead.error, "SELECT");
  }
  if (!applicationRead.data) {
    throw new Error(
      `Application lookup failed for designer_applications row ${applicationId}: the row is missing or not visible to this admin under Row Level Security.`
    );
  }
  if (applicationRead.data.status !== "pending") {
    throw new Error(
      `Application ${applicationId} is no longer pending (current status: ${applicationRead.data.status || "empty"}). Refresh the admin list before retrying.`
    );
  }
  if (applicationRead.data.user_id !== application.user_id) {
    throw new Error(`Application ${applicationId} no longer belongs to the expected designer account.`);
  }
  const currentApplication = applicationRead.data;

  const { data: existing, error: lookupError } = await supabase
    .from("designers")
    .select("id")
    .eq("user_id", currentApplication.user_id)
    .maybeSingle();
  if (lookupError) {
    throw actionError("Designer lookup", "designers", currentApplication.user_id, lookupError, "SELECT");
  }

  if (!existing) {
    const { error: insertError } = await supabase.from("designers").insert({
      user_id: currentApplication.user_id,
      name: currentApplication.org_name,
      city: currentApplication.city,
      email: currentApplication.email,
      phone: currentApplication.phone,
      designer_type: currentApplication.designer_type,
      is_verified: false,
      rating_avg: 0,
      rating_count: 0,
    });
    if (insertError) {
      throw actionError("Designer creation", "designers", currentApplication.user_id, insertError, "INSERT");
    }
  }

  // The application remains pending until both the designer record and role
  // update succeed, so an admin can safely retry a partial onboarding.
  const roleResult = await supabase
    .from("users")
    .update({ role: "designer" })
    .eq("id", currentApplication.user_id)
    .select("id");
  requireExactlyOneUpdatedRow(roleResult.data, roleResult.error, {
    action: "Designer role update",
    table: "users",
    id: currentApplication.user_id,
  });

  const applicationResult = await supabase
    .from("designer_applications")
    .update({ status: "approved" })
    .eq("id", applicationId)
    .eq("status", "pending")
    .select("id");
  requireExactlyOneUpdatedRow(applicationResult.data, applicationResult.error, {
    action: "Application approval",
    table: "designer_applications",
    id: applicationId,
  });
};

export const onboardDesignerApplicationWithSuccess = async (
  supabase,
  application,
  onSuccess
) => {
  await onboardDesignerApplication(supabase, application);
  onSuccess();
};

export const rejectDesignerApplication = async (supabase, applicationId) => {
  const result = await supabase
    .from("designer_applications")
    .update({ status: "rejected" })
    .eq("id", applicationId)
    .select("id");
  requireExactlyOneUpdatedRow(result.data, result.error, {
    action: "Application rejection",
    table: "designer_applications",
    id: applicationId,
  });
};

export const verifyDesignerProfile = async (supabase, designerId) => {
  const result = await supabase
    .from("designers")
    .update({
      is_verified: true,
      is_subscription_active: false,
      subscription_end: null,
      is_public: false,
    })
    .eq("id", designerId)
    .select("id");
  requireExactlyOneUpdatedRow(result.data, result.error, {
    action: "Designer verification",
    table: "designers",
    id: designerId,
  });
};
