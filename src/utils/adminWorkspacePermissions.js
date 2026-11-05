export const isAdminWorkspaceOverride = ({ designerRouteId, authenticatedRole }) =>
  Boolean(designerRouteId) && authenticatedRole === "admin";

export const canMutateWorkspaceInquiries = (isAdminOverride) => !isAdminOverride;

export const createInquiryMutationHandler = (isAdminOverride, onMutation) =>
  async function handleStatusUpdate(...args) {
    if (!canMutateWorkspaceInquiries(isAdminOverride)) return;
    return onMutation(...args);
  };
