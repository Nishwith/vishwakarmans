import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isInquiryRpcEnabled,
  submitOrReopenInquiry,
  archiveInquiry,
} from "../services/designerInquiryService";

afterEach(() => vi.unstubAllEnvs());

describe("designerInquiryService (Option B Inquiry Lifecycle & Concurrency)", () => {
  it("rejects invalid inputs without making database calls", async () => {
    const supabase = { rpc: vi.fn(), from: vi.fn() };

    await expect(submitOrReopenInquiry(null, {}))
      .rejects.toThrow("Supabase client is required.");

    await expect(submitOrReopenInquiry(supabase, { designerId: null, message: "Hello" }))
      .rejects.toThrow("A target designer ID is required.");

    await expect(submitOrReopenInquiry(supabase, { designerId: -5, message: "Hello" }))
      .rejects.toThrow("A valid designer ID is required.");

    await expect(submitOrReopenInquiry(supabase, { designerId: 10, message: "   " }))
      .rejects.toThrow("Inquiry message cannot be empty.");

    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("falls back to standard Supabase table insert when rpc is not present", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: 77, status: "pending", designer_id: 20 },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });

    const supabase = {
      from,
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u-123" } } }) },
    };

    const result = await submitOrReopenInquiry(supabase, {
      designerId: 20,
      clientName: "Homeowner",
      message: "Hello",
    });

    expect(from).toHaveBeenCalledWith("connections");
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      designer_id: 20,
      client_id: "u-123",
      message: "Hello",
    }));
    expect(result.connection_id).toBe(77);
  });

  it("invokes submit_or_reopen_designer_inquiry RPC when feature flag is enabled", async () => {
    vi.stubEnv("VITE_PHASE1A_INQUIRY_RPC_ENABLED", "true");
    expect(isInquiryRpcEnabled()).toBe(true);

    const rpc = vi.fn().mockResolvedValue({
      data: {
        action: "reopened",
        connection_id: 42,
        status: "pending",
      },
      error: null,
    });

    const supabase = { rpc, from: vi.fn() };
    const result = await submitOrReopenInquiry(supabase, {
      designerId: 20,
      clientName: "Homeowner One",
      clientEmail: "home@example.com",
      clientPhone: "9999999999",
      message: "Reopening my inquiry for kitchen design",
    });

    expect(rpc).toHaveBeenCalledExactlyOnceWith("submit_or_reopen_designer_inquiry", {
      p_designer_id: 20,
      p_client_name: "Homeowner One",
      p_client_email: "home@example.com",
      p_client_phone: "9999999999",
      p_message: "Reopening my inquiry for kitchen design",
    });
    expect(result.action).toBe("reopened");
    expect(result.connection_id).toBe(42);
    expect(result.status).toBe("pending");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("propagates RPC errors directly without falling back to direct database writes", async () => {
    vi.stubEnv("VITE_PHASE1A_INQUIRY_RPC_ENABLED", "true");

    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "42501", message: "Authentication required to submit an inquiry" },
    });
    const supabase = { rpc, from: vi.fn() };

    await expect(
      submitOrReopenInquiry(supabase, {
        designerId: 20,
        message: "Hello",
      })
    ).rejects.toMatchObject({ code: "42501" });

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("handles simultaneous first-time submissions deterministically", async () => {
    vi.stubEnv("VITE_PHASE1A_INQUIRY_RPC_ENABLED", "true");

    // Two concurrent submissions by the same client:
    // First call returns created, second call returns reopened
    let callCount = 0;
    const rpc = vi.fn().mockImplementation(() => {
      callCount += 1;
      return Promise.resolve({
        data: {
          action: callCount === 1 ? "created" : "reopened",
          connection_id: 99,
          status: "pending",
        },
        error: null,
      });
    });

    const supabase = { rpc, from: vi.fn() };

    const [sub1, sub2] = await Promise.all([
      submitOrReopenInquiry(supabase, { designerId: 20, message: "First submission" }),
      submitOrReopenInquiry(supabase, { designerId: 20, message: "Simultaneous second submission" }),
    ]);

    expect(rpc).toHaveBeenCalledTimes(2);
    expect(sub1.connection_id).toBe(99);
    expect(sub2.connection_id).toBe(99);
    expect([sub1.action, sub2.action].sort()).toEqual(["created", "reopened"]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("handles simultaneous reopening of an existing connection", async () => {
    vi.stubEnv("VITE_PHASE1A_INQUIRY_RPC_ENABLED", "true");

    const rpc = vi.fn().mockResolvedValue({
      data: {
        action: "reopened",
        connection_id: 99,
        status: "pending",
      },
      error: null,
    });

    const supabase = { rpc, from: vi.fn() };

    const [reopen1, reopen2] = await Promise.all([
      submitOrReopenInquiry(supabase, { designerId: 20, message: "Reopen attempt 1" }),
      submitOrReopenInquiry(supabase, { designerId: 20, message: "Reopen attempt 2" }),
    ]);

    expect(reopen1.action).toBe("reopened");
    expect(reopen2.action).toBe("reopened");
    expect(reopen1.connection_id).toBe(99);
    expect(reopen2.connection_id).toBe(99);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("archiveInquiry falls back to standard table update when rpc is not present", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: 42, status: "archived" },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });

    const supabase = { from };

    const result = await archiveInquiry(supabase, 42);
    expect(from).toHaveBeenCalledWith("connections");
    expect(update).toHaveBeenCalledWith({ status: "archived" });
    expect(eq).toHaveBeenCalledWith("id", 42);
    expect(result.status).toBe("archived");
  });

  it("archiveInquiry invokes designer_archive_connection RPC when enabled", async () => {
    vi.stubEnv("VITE_PHASE1A_INQUIRY_RPC_ENABLED", "true");

    const rpc = vi.fn().mockResolvedValue({
      data: { action: "archived", connection_id: 42, status: "archived" },
      error: null,
    });
    const supabase = { rpc, from: vi.fn() };

    const result = await archiveInquiry(supabase, 42);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("designer_archive_connection", {
      p_connection_id: 42,
    });
    expect(result.status).toBe("archived");
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
