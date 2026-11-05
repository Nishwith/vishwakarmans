/**
 * The existing is_verified flag is the admin's profile-review decision. The
 * application approval process creates the designer row, so this public
 * eligibility predicate uses the existing designer-table publication fields.
 */
export const isDesignerPubliclyEligible = (designer, now = new Date()) => {
  if (
    designer?.is_verified !== true ||
    designer?.is_public !== true ||
    designer?.is_subscription_active !== true
  ) {
    return false;
  }

  if (designer.subscription_end && new Date(designer.subscription_end) <= now) {
    return false;
  }

  return true;
};
