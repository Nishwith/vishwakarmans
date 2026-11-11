import { describe, expect, it, vi } from "vitest";
import { setDesignerPublicVisibility } from "../services/designerVisibilityAdminService";
import { isDesignerPubliclyEligible } from "../utils/designerVisibility";

function createSupabaseMock(result) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const select = vi.fn(() => ({ maybeSingle }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ update }));

  return { client: { from }, calls: { from, update, eq, select, maybeSingle } };
}

describe("setDesignerPublicVisibility", () => {
  it("changes only is_public and returns the updated designer ID", async () => {
    const { client, calls } = createSupabaseMock({ data: { id: 29 }, error: null });

    await expect(setDesignerPublicVisibility(client, 29, false)).resolves.toEqual({ id: 29 });
    expect(calls.from).toHaveBeenCalledWith("designers");
    expect(calls.update).toHaveBeenCalledWith({ is_public: false });
    expect(calls.eq).toHaveBeenCalledWith("id", 29);
  });

  it("supports reactivation without changing verification or subscription fields", async () => {
    const { client, calls } = createSupabaseMock({ data: { id: 29 }, error: null });

    await setDesignerPublicVisibility(client, 29, true);

    expect(calls.update).toHaveBeenCalledWith({ is_public: true });
  });

  it("keeps a deactivated designer out of public discovery", () => {
    const designer = {
      is_verified: true,
      is_public: false,
      is_subscription_active: true,
    };

    expect(isDesignerPubliclyEligible(designer)).toBe(false);
  });

  it("fails when no matching row was updated", async () => {
    const { client } = createSupabaseMock({ data: null, error: null });

    await expect(setDesignerPublicVisibility(client, 29, false)).rejects.toThrow(
      "No designer profile was updated.",
    );
  });

  it("surfaces Supabase authorization and database errors", async () => {
    const error = new Error("permission denied");
    const { client } = createSupabaseMock({ data: null, error });

    await expect(setDesignerPublicVisibility(client, 29, false)).rejects.toBe(error);
  });

  it("rejects a missing designer ID before issuing a query", async () => {
    const { client, calls } = createSupabaseMock({ data: null, error: null });

    await expect(setDesignerPublicVisibility(client, undefined, false)).rejects.toThrow(
      "A designer ID is required.",
    );
    expect(calls.from).not.toHaveBeenCalled();
  });
});
