/**
 * Changes only public discoverability. This intentionally preserves verification,
 * subscription, ownership, portfolio and historical inquiry/payment data.
 * Database RLS must independently authorize this administrator operation.
 */
export async function setDesignerPublicVisibility(supabase, designerId, isPublic) {
  if (designerId === null || designerId === undefined) {
    throw new Error("A designer ID is required.");
  }

  const parsedId = Number(designerId);
  const targetId = !isNaN(parsedId) ? parsedId : designerId;

  const { data, error } = await supabase
    .from("designers")
    .update({ is_public: Boolean(isPublic) })
    .eq("id", targetId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No designer profile was updated.");
  return data;
}
