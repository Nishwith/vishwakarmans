import { afterEach, describe, expect, it, vi } from "vitest";
import { checkServerAdminAuthorization, resolveAdminAuthorization } from "../services/phase1aAuthorizationService";
import { approveApplicationWithSecureRpc } from "../services/phase1aApprovalService";

afterEach(() => vi.unstubAllEnvs());

describe("Phase 1A disabled-by-default adapters", () => {
  it("fails closed without trusting editable users.role when the secure RPC gate is off", async () => {
    vi.stubEnv("VITE_PHASE1A_ADMIN_AUTH_RPC_ENABLED", "false");
    const rpc = vi.fn();
    await expect(resolveAdminAuthorization({ rpc }, { role: "admin" }))
      .resolves.toEqual({ enabled: false, authorized: false });
    await expect(resolveAdminAuthorization({ rpc }, { role: "client" }))
      .resolves.toEqual({ enabled: false, authorized: false });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("uses only the authenticated client RPC, supporting separate allowlisted admins without UUIDs", async () => {
    vi.stubEnv("VITE_PHASE1A_ADMIN_AUTH_RPC_ENABLED", "true");
    const firstAdminRpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const secondAdminRpc = vi.fn().mockResolvedValue({ data: true, error: null });
    await expect(checkServerAdminAuthorization({ rpc: firstAdminRpc }))
      .resolves.toEqual({ enabled: true, authorized: true });
    await expect(checkServerAdminAuthorization({ rpc: secondAdminRpc }))
      .resolves.toEqual({ enabled: true, authorized: true });
    expect(firstAdminRpc).toHaveBeenCalledExactlyOnceWith("is_admin");
    expect(secondAdminRpc).toHaveBeenCalledExactlyOnceWith("is_admin");
    expect(JSON.stringify([firstAdminRpc.mock.calls, secondAdminRpc.mock.calls])).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-/i);
  });

  it("calls atomic approval and validates the result", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { application_id: 21, status: "approved", designer_id: 29 }, error: null,
    });
    await expect(approveApplicationWithSecureRpc({ rpc }, "21")).resolves.toMatchObject({
      enabled: true, result: { status: "approved", designer_id: 29 },
    });
    expect(rpc).toHaveBeenCalledExactlyOnceWith("admin_approve_designer_application", {
      p_application_id: 21,
    });
  });

  it("does not hide approval RPC errors or accept an unconfirmed result", async () => {
    vi.stubEnv("VITE_PHASE1A_APPROVAL_RPC_ENABLED", "true");
    const rpcError = new Error("permission denied");
    await expect(approveApplicationWithSecureRpc({ rpc: vi.fn().mockResolvedValue({ error: rpcError }) }, 21))
      .rejects.toBe(rpcError);
    await expect(approveApplicationWithSecureRpc({ rpc: vi.fn().mockResolvedValue({ data: null, error: null }) }, 21))
      .rejects.toThrow(/did not confirm/i);
  });
});
