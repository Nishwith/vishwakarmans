import { afterEach, describe, expect, it, vi } from "vitest";
import {
  onboardDesignerApplication,
  onboardDesignerApplicationWithSuccess,
  rejectDesignerApplication,
  verifyDesignerProfile,
} from "../services/designerApplicationAdminService";

afterEach(() => vi.unstubAllEnvs());

const application = {
  id: 19,
  user_id: "designer-1",
  org_name: "Studio One",
  city: "Hyderabad",
  email: "studio@example.com",
  phone: "9876543210",
  designer_type: "interior",
};

describe("designerApplicationAdminService (Approval Security)", () => {
  it("validates application ID when approving", async () => {
    const client = { from: vi.fn(), rpc: vi.fn() };

    await expect(onboardDesignerApplication(client, null))
      .rejects.toThrow(/designer application ID is required/i);

    expect(client.from).not.toHaveBeenCalled();
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("calls atomic approval RPC and returns structured result when enabled", async () => {
    vi.stubEnv("VITE_PHASE1A_APPROVAL_RPC_ENABLED", "true");
    const rpc = vi.fn().mockResolvedValue({
      data: {
        application_id: 19,
        status: "approved",
        designer_id: 42,
        created: true,
      },
      error: null,
    });
    const client = { rpc, from: vi.fn() };

    const result = await onboardDesignerApplication(client, application);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("admin_approve_designer_application", {
      p_application_id: 19,
    });
    expect(result.status).toBe("approved");
    expect(result.designer_id).toBe(42);
    expect(client.from).not.toHaveBeenCalled();
  });

  it("runs the success notification only after secure approval succeeds", async () => {
    vi.stubEnv("VITE_PHASE1A_APPROVAL_RPC_ENABLED", "true");
    const rpc = vi.fn().mockResolvedValue({
      data: { application_id: 19, status: "approved", designer_id: 42 },
      error: null,
    });
    const client = { rpc };
    const notifySuccess = vi.fn();

    await onboardDesignerApplicationWithSuccess(client, application, notifySuccess);
    expect(notifySuccess).toHaveBeenCalledOnce();
  });

  it("does not run the success notification when approval fails closed or RPC errors", async () => {
    vi.stubEnv("VITE_PHASE1A_APPROVAL_RPC_ENABLED", "false");
    const client = { rpc: vi.fn(), from: vi.fn() };
    const notifySuccess = vi.fn();

    await expect(onboardDesignerApplicationWithSuccess(client, application, notifySuccess))
      .rejects.toThrow();
    expect(notifySuccess).not.toHaveBeenCalled();
  });

  it("records rejection via secure admin RPC when enabled", async () => {
    vi.stubEnv("VITE_PHASE1A_ADMIN_OPS_RPC_ENABLED", "true");
    const rpc = vi.fn().mockResolvedValue({
      data: { action: "rejected", application_id: application.id, status: "rejected" },
      error: null,
    });
    const client = { rpc, from: vi.fn() };

    const result = await rejectDesignerApplication(client, application.id);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("admin_reject_designer_application", {
      p_application_id: application.id,
      p_rejection_reason: null,
    });
    expect(result.status).toBe("rejected");
    expect(client.from).not.toHaveBeenCalled();
  });

  it("marks the designer verified via secure admin RPC when enabled", async () => {
    vi.stubEnv("VITE_PHASE1A_ADMIN_OPS_RPC_ENABLED", "true");
    const rpc = vi.fn().mockResolvedValue({
      data: { action: "verified", designer_id: 42, is_verified: true, is_public: false },
      error: null,
    });
    const client = { rpc, from: vi.fn() };

    const result = await verifyDesignerProfile(client, 42);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("admin_verify_designer", {
      p_designer_id: 42,
    });
    expect(result.is_verified).toBe(true);
    expect(client.from).not.toHaveBeenCalled();
  });
});
