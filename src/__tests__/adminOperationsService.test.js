import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isAdminOperationsRpcEnabled,
  verifyDesignerWithSecureRpc,
  rejectApplicationWithSecureRpc,
  updateContactMessageStatusWithSecureRpc,
  deleteContactMessageWithSecureRpc,
} from "../services/adminOperationsService";

afterEach(() => vi.unstubAllEnvs());

describe("adminOperationsService (Privileged Workflows)", () => {
  it("has admin operations RPC permanently enabled", () => {
    expect(isAdminOperationsRpcEnabled()).toBe(true);
  });

  it("validates required inputs before making RPC calls", async () => {
    const supabase = { rpc: vi.fn() };

    await expect(verifyDesignerWithSecureRpc(supabase, null))
      .rejects.toThrow(/designer ID is required/i);

    await expect(rejectApplicationWithSecureRpc(supabase, "invalid"))
      .rejects.toThrow(/valid application ID is required/i);

    await expect(updateContactMessageStatusWithSecureRpc(supabase, 5, ""))
      .rejects.toThrow(/Status cannot be empty/i);

    await expect(deleteContactMessageWithSecureRpc(supabase, -1))
      .rejects.toThrow(/valid message ID is required/i);

    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("calls admin_verify_designer RPC when enabled and returns confirmed result", async () => {
    vi.stubEnv("VITE_PHASE1A_ADMIN_OPS_RPC_ENABLED", "true");

    const rpc = vi.fn().mockResolvedValue({
      data: { action: "verified", designer_id: 42, is_verified: true, is_public: false },
      error: null,
    });
    const supabase = { rpc };

    const result = await verifyDesignerWithSecureRpc(supabase, 42);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("admin_verify_designer", { p_designer_id: 42 });
    expect(result.is_verified).toBe(true);
  });

  it("calls admin_reject_designer_application RPC when enabled", async () => {
    vi.stubEnv("VITE_PHASE1A_ADMIN_OPS_RPC_ENABLED", "true");

    const rpc = vi.fn().mockResolvedValue({
      data: { action: "rejected", application_id: 19, status: "rejected", reason: "Invalid license" },
      error: null,
    });
    const supabase = { rpc };

    const result = await rejectApplicationWithSecureRpc(supabase, 19, "Invalid license");
    expect(rpc).toHaveBeenCalledExactlyOnceWith("admin_reject_designer_application", {
      p_application_id: 19,
      p_rejection_reason: "Invalid license",
    });
    expect(result.status).toBe("rejected");
  });

  it("calls admin_update_contact_message_status RPC when enabled", async () => {
    vi.stubEnv("VITE_PHASE1A_ADMIN_OPS_RPC_ENABLED", "true");

    const rpc = vi.fn().mockResolvedValue({
      data: { action: "updated", message_id: 5, status: "contacted" },
      error: null,
    });
    const supabase = { rpc };

    const result = await updateContactMessageStatusWithSecureRpc(supabase, 5, "contacted");
    expect(rpc).toHaveBeenCalledExactlyOnceWith("admin_update_contact_message_status", {
      p_message_id: 5,
      p_status: "contacted",
    });
    expect(result.status).toBe("contacted");
  });

  it("calls admin_delete_contact_message RPC when enabled", async () => {
    vi.stubEnv("VITE_PHASE1A_ADMIN_OPS_RPC_ENABLED", "true");

    const rpc = vi.fn().mockResolvedValue({
      data: { action: "deleted", message_id: 5 },
      error: null,
    });
    const supabase = { rpc };

    const result = await deleteContactMessageWithSecureRpc(supabase, 5);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("admin_delete_contact_message", {
      p_message_id: 5,
    });
    expect(result.action).toBe("deleted");
  });

  it("propagates authorization errors without attempting direct table writes", async () => {
    vi.stubEnv("VITE_PHASE1A_ADMIN_OPS_RPC_ENABLED", "true");

    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "42501", message: "Administrator authorization required" },
    });
    const supabase = { rpc };

    await expect(verifyDesignerWithSecureRpc(supabase, 42)).rejects.toMatchObject({ code: "42501" });
  });
});

