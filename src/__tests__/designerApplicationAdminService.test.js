import { describe, expect, it, vi } from "vitest";
import {
  onboardDesignerApplication,
  onboardDesignerApplicationWithSuccess,
  rejectDesignerApplication,
  verifyDesignerProfile,
} from "../services/designerApplicationAdminService";

const application = {
  id: 19,
  user_id: "designer-1",
  org_name: "Studio One",
  city: "Hyderabad",
  email: "studio@example.com",
  phone: "9876543210",
  designer_type: "interior",
};

const createAdminClient = ({
  existingDesigner = null,
  designerLookup = null,
  applicationLookup = null,
  designerInsert = { error: null },
  roleUpdate = { data: [{ id: application.user_id }], error: null },
  applicationUpdate = { data: [{ id: application.id }], error: null },
  verificationUpdate = { data: [{ id: 42 }], error: null },
  rejectionUpdate = { data: [{ id: application.id }], error: null },
} = {}) => {
  const calls = [];
  const client = {
    from: vi.fn((table) => {
      const query = {
        select: vi.fn(() => query),
        eq: vi.fn((column, value) => {
          calls.push({ table, operation: "filter", column, value });
          return query;
        }),
        maybeSingle: vi.fn(async () => {
          if (table === "designers") return designerLookup || { data: existingDesigner, error: null };
          if (table === "designer_applications") {
            return applicationLookup || { data: { ...application, status: "pending" }, error: null };
          }
          return { data: null, error: null };
        }),
        insert: vi.fn(async (payload) => {
          calls.push({ table, operation: "insert", payload });
          return designerInsert;
        }),
        update: vi.fn((payload) => {
          calls.push({ table, operation: "update", payload });
          let response = { data: null, error: null };
          if (table === "users") response = roleUpdate;
          if (table === "designer_applications") {
            response = payload.status === "rejected" ? rejectionUpdate : applicationUpdate;
          }
          if (table === "designers") response = verificationUpdate;
          const builder = {
            eq: vi.fn((column, value) => {
              calls.push({ table, operation: "filter", column, value });
              return builder;
            }),
            select: vi.fn(() => builder),
            then: (resolve, reject) => Promise.resolve(response).then(resolve, reject),
          };
          return builder;
        }),
      };
      return query;
    }),
  };
  return { client, calls };
};

describe("designer application admin actions", () => {
  it("creates a restricted designer, updates role, then records application approval", async () => {
    const { client, calls } = createAdminClient();
    await onboardDesignerApplication(client, application);

    expect(calls).toContainEqual({
      table: "designers",
      operation: "insert",
      payload: {
        user_id: "designer-1",
        name: "Studio One",
        city: "Hyderabad",
        email: "studio@example.com",
        phone: "9876543210",
        designer_type: "interior",
        is_verified: false,
        rating_avg: 0,
        rating_count: 0,
      },
    });
    expect(calls).toContainEqual({
      table: "users",
      operation: "update",
      payload: { role: "designer" },
    });
    expect(calls).toContainEqual({
      table: "designer_applications",
      operation: "update",
      payload: { status: "approved" },
    });
    expect(calls.findIndex((call) => call.table === "users" && call.operation === "update"))
      .toBeLessThan(calls.findIndex((call) => call.table === "designer_applications" && call.operation === "update"));
    expect(calls).toContainEqual({
      table: "designer_applications",
      operation: "filter",
      column: "id",
      value: 19,
    });
    expect(calls).toContainEqual({
      table: "designer_applications",
      operation: "filter",
      column: "status",
      value: "pending",
    });
  });

  it("reports a missing application row and does not treat it as approved", async () => {
    const { client, calls } = createAdminClient({ applicationLookup: { data: null, error: null } });
    await expect(onboardDesignerApplication(client, application))
      .rejects.toThrow(/row 19: the row is missing or not visible/i);
    expect(calls.some((call) => call.table === "designers" && call.operation === "insert")).toBe(false);
  });

  it("surfaces an RLS denial while looking up an application", async () => {
    const denied = { code: "42501", message: "permission denied for table designer_applications" };
    const { client } = createAdminClient({ applicationLookup: { data: null, error: denied } });
    await expect(onboardDesignerApplication(client, application))
      .rejects.toThrow(/Application lookup failed.*permission denied.*code 42501.*SELECT policy/);
  });

  it("surfaces an RLS denial with database details", async () => {
    const denied = { code: "42501", message: "new row violates row-level security policy" };
    const { client } = createAdminClient({ applicationUpdate: { data: null, error: denied } });
    await expect(onboardDesignerApplication(client, application))
      .rejects.toThrow(/new row violates row-level security policy.*code 42501.*UPDATE policy/i);
  });

  it("reports zero updated rows", async () => {
    const { client } = createAdminClient({ roleUpdate: { data: [], error: null } });
    await expect(onboardDesignerApplication(client, application))
      .rejects.toThrow(/users row designer-1: no row was updated/i);
  });

  it("rejects a response that contains multiple matched rows", async () => {
    const { client } = createAdminClient({
      applicationUpdate: { data: [{ id: 19 }, { id: 19 }], error: null },
    });
    await expect(onboardDesignerApplication(client, application))
      .rejects.toThrow(/2 rows were updated; exactly one was expected/i);
  });

  it("surfaces database errors during application approval", async () => {
    const { client } = createAdminClient({
      applicationUpdate: { data: null, error: { code: "XX000", message: "database unavailable" } },
    });
    await expect(onboardDesignerApplication(client, application))
      .rejects.toThrow(/database unavailable/);
  });

  it("surfaces an RLS denial when approval status is updated", async () => {
    const denied = { code: "42501", message: "new row violates row-level security policy" };
    const { client } = createAdminClient({ applicationUpdate: { data: null, error: denied } });
    await expect(onboardDesignerApplication(client, application))
      .rejects.toThrow(/new row violates row-level security policy.*code 42501.*UPDATE policy/i);
  });

  it("does not approve the application if designer creation fails", async () => {
    const { client, calls } = createAdminClient({
      designerInsert: { error: { code: "42501", message: "insert denied" } },
    });
    await expect(onboardDesignerApplication(client, application)).rejects.toThrow(/insert denied/);
    expect(calls.some((call) => call.table === "designer_applications" && call.operation === "update")).toBe(false);
  });

  it("keeps the application pending if the user role update fails", async () => {
    const { client, calls } = createAdminClient({
      roleUpdate: { data: null, error: { code: "42501", message: "role update denied" } },
    });
    await expect(onboardDesignerApplication(client, application)).rejects.toThrow(/role update denied/);
    expect(calls.some((call) => call.table === "designer_applications" && call.operation === "update")).toBe(false);
  });

  it("does not run the success notification after any failed database step", async () => {
    const notifySuccess = vi.fn();
    const { client } = createAdminClient({ applicationUpdate: { data: [], error: null } });
    await expect(onboardDesignerApplicationWithSuccess(client, application, notifySuccess)).rejects.toThrow();
    expect(notifySuccess).not.toHaveBeenCalled();
  });

  it("runs the success notification only after approval succeeds", async () => {
    const notifySuccess = vi.fn();
    const { client } = createAdminClient();
    await onboardDesignerApplicationWithSuccess(client, application, notifySuccess);
    expect(notifySuccess).toHaveBeenCalledOnce();
  });

  it("records rejection in the existing status field", async () => {
    const { client, calls } = createAdminClient();
    await rejectDesignerApplication(client, application.id);
    expect(calls).toContainEqual({
      table: "designer_applications",
      operation: "update",
      payload: { status: "rejected" },
    });
  });

  it("marks the designer verified while retaining the payment lock fields", async () => {
    const { client, calls } = createAdminClient();
    await verifyDesignerProfile(client, 42);
    expect(calls).toContainEqual({
      table: "designers",
      operation: "update",
      payload: {
        is_verified: true,
        is_subscription_active: false,
        subscription_end: null,
        is_public: false,
      },
    });
  });
});
