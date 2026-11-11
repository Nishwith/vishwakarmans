import { approveApplicationWithSecureRpc } from "./phase1aApprovalService";
import {
  verifyDesignerWithSecureRpc,
  rejectApplicationWithSecureRpc,
} from "./adminOperationsService";

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
  const secureApproval = await approveApplicationWithSecureRpc(supabase, application?.id);
  return secureApproval.result;
};

export const onboardDesignerApplicationWithSuccess = async (
  supabase,
  application,
  onSuccess
) => {
  await onboardDesignerApplication(supabase, application);
  onSuccess();
};

export const rejectDesignerApplication = async (supabase, applicationId, reason = null) => {
  return rejectApplicationWithSecureRpc(supabase, applicationId, reason);
};

export const verifyDesignerProfile = async (supabase, designerId) => {
  return verifyDesignerWithSecureRpc(supabase, designerId);
};
