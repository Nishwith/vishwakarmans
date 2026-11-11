import { afterEach, describe, expect, it, vi } from "vitest";
import { claimVipDesignerProfile } from "../services/vipDesignerClaimService";

afterEach(() => vi.unstubAllEnvs());

describe("VIP designer claim adapter", () => {
  it("never invokes an undeployed claim RPC", async () => {
    vi.stubEnv("VITE_PHASE1A_VIP_CLAIM_RPC_ENABLED", "false");
    const rpc = vi.fn();
    await expect(claimVipDesignerProfile({ rpc })).resolves.toEqual({ enabled: false });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("uses a no-argument RPC so the server derives the Auth identity", async () => {
    vi.stubEnv("VITE_PHASE1A_VIP_CLAIM_RPC_ENABLED", "true");
    const rpc = vi.fn().mockResolvedValue({ data: { claimed: true, designer_id: 29 }, error: null });
    await expect(claimVipDesignerProfile({ rpc })).resolves.toEqual({
      enabled: true, result: { claimed: true, designer_id: 29 },
    });
    expect(rpc).toHaveBeenCalledExactlyOnceWith("claim_vip_designer_profile");
  });
});
