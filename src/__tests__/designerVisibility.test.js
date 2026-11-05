import { describe, expect, it } from "vitest";
import { isDesignerPubliclyEligible } from "../utils/designerVisibility";

describe("public designer eligibility", () => {
  const eligibleDesigner = {
    is_verified: true,
    is_public: true,
    is_subscription_active: true,
    subscription_end: "2030-01-01T00:00:00.000Z",
  };
  const now = new Date("2029-01-01T00:00:00.000Z");

  it("requires profile verification, publication enabled, and active payment", () => {
    expect(isDesignerPubliclyEligible(eligibleDesigner, now)).toBe(true);
    expect(isDesignerPubliclyEligible({ ...eligibleDesigner, is_verified: false }, now)).toBe(false);
    expect(isDesignerPubliclyEligible({ ...eligibleDesigner, is_public: false }, now)).toBe(false);
    expect(isDesignerPubliclyEligible({ ...eligibleDesigner, is_subscription_active: false }, now)).toBe(false);
  });

  it("hides profiles after subscription expiry", () => {
    expect(isDesignerPubliclyEligible({
      ...eligibleDesigner,
      subscription_end: "2028-12-31T23:59:59.000Z",
    }, now)).toBe(false);
  });

  it("retains the existing no-expiry-date behavior for active subscriptions", () => {
    expect(isDesignerPubliclyEligible({ ...eligibleDesigner, subscription_end: null }, now)).toBe(true);
  });
});
