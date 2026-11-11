import { afterEach, describe, expect, it, vi } from "vitest";
import { updateUserProfile } from "../services/authService";

vi.mock("../services/supabaseClient", () => ({
  supabase: { auth: { getUser: vi.fn() }, from: vi.fn() },
}));

import { supabase } from "../services/supabaseClient";

afterEach(() => vi.clearAllMocks());

describe("ordinary users profile updates", () => {
  it("accepts only the approved profile fields for the authenticated owner", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    supabase.from.mockReturnValue({ update });

    const fields = {
      full_name: "Ada", phone: "9876543210", city: "Hyderabad",
      location: "POINT(78.4 17.3)", profile_completed: true,
    };
    await updateUserProfile("u-1", fields);
    expect(update).toHaveBeenCalledWith(fields);
    expect(eq).toHaveBeenCalledWith("id", "u-1");
  });

  it.each(["id", "email", "role", "is_admin"])("rejects protected field %s before querying", async (field) => {
    await expect(updateUserProfile("u-1", { [field]: "attacker-value" })).rejects.toThrow(/unsupported fields/i);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("rejects an update targeting another user", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
    await expect(updateUserProfile("u-2", { city: "Pune" })).rejects.toThrow(/authenticated user/i);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
