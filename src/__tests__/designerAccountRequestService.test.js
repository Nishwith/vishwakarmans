import { afterEach, describe, expect, it, vi } from "vitest";
import { submitDesignerAccountRequest } from "../services/designerAccountRequestService";

afterEach(() => vi.unstubAllEnvs());

describe("designer renewal request adapter", () => {
  it("does not call an undeployed RPC", async () => {
    vi.stubEnv("VITE_PHASE1A_DESIGNER_REQUEST_RPC_ENABLED", "false");
    const rpc = vi.fn();
    await expect(submitDesignerAccountRequest({ rpc }, "renewal")).rejects.toThrow(/workflow is deployed/i);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("calls the authenticated renewal workflow when enabled", async () => {
    vi.stubEnv("VITE_PHASE1A_DESIGNER_REQUEST_RPC_ENABLED", "true");
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    await expect(submitDesignerAccountRequest({ rpc }, "renewal")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("designer_request_renewal");
  });
});
