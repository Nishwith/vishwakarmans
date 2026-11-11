import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DesignerDashboard from "../pages/DesignerDashboard";
import {
  createInquiryMutationHandler,
  isAdminWorkspaceOverride,
} from "../utils/adminWorkspacePermissions";

const mocks = vi.hoisted(() => ({
  userId: "workspace-user",
  role: "admin",
  designer: null,
  leads: [],
  connectionSelections: [],
  connectionCountFilters: [],
  connectionOrders: [],
  mutations: [],
  from: vi.fn(),
  rpc: vi.fn(),
}));

const toastMock = vi.hoisted(() => Object.assign(vi.fn(), {
  error: vi.fn(),
  success: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
}));

vi.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({
        data: { session: { user: { id: mocks.userId } } },
        error: null,
      })),
    },
    from: mocks.from,
    rpc: mocks.rpc,
    functions: { invoke: vi.fn(async () => ({ data: null, error: null })) },
    storage: {
      from: () => ({
        upload: vi.fn(async () => ({ data: {}, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.test/logo.png" } })),
      }),
    },
  },
}));

vi.mock("../services/authService", () => ({ signOut: vi.fn() }));
vi.mock("../utils/imageCompression", () => ({ compressImage: vi.fn(async (file) => file) }));
vi.mock("react-hot-toast", () => ({ default: toastMock }));

const renderWorkspace = (initialEntry) => render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/dashboard" element={<DesignerDashboard />} />
        <Route path="/admin/manage-designer/:id" element={<DesignerDashboard />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);

describe("admin Manage Workspace inquiry permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.role = "admin";
    mocks.designer = {
      id: 29,
      user_id: "designer-user",
      name: "Studio One",
      city: "Hyderabad",
      projects_completed: 4,
      profile_views: 120,
      about_text: "A complete studio profile",
      experience_years: 6,
      designer_type: "interior",
      style_tags: ["Residential"],
      video_link: "",
      video_link_2: "",
      is_verified: true,
      is_public: true,
      is_subscription_active: true,
      subscription_end: "2099-01-01T00:00:00.000Z",
    };
    mocks.leads = [{
      id: 501,
      designer_id: 29,
      client_id: "client-user",
      status: "pending",
      message: "Please redesign the kitchen and dining area.",
      client: {
        full_name: "Client Example",
        email: "client@example.com",
        phone: "+91-9000000000",
        city: "Hyderabad",
      },
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    }];
    mocks.connectionSelections = [];
    mocks.connectionCountFilters = [];
    mocks.connectionOrders = [];
    mocks.rpc.mockReset();
    mocks.rpc.mockImplementation(async (fnName) => {
      if (fnName === "designer_archive_connection") {
        return { data: { status: "archived" }, error: null };
      }
      return { data: 3, error: null };
    });
    mocks.mutations = [];
    mocks.from.mockImplementation((table) => {
      const query = {
        select: vi.fn((columns, options) => {
          if (table === "connections") {
            mocks.connectionSelections.push({ columns, options });
            query.isHeadCount = options?.head === true;
          }
          return query;
        }),
        eq: vi.fn((column, value) => {
          if (table === "connections" && query.isHeadCount) {
            mocks.connectionCountFilters.push({ column, value });
            query.countFilters ??= {};
            query.countFilters[column] = value;
          }
          return query;
        }),
        order: vi.fn(async () => {
          if (table === "connections") mocks.connectionOrders.push(true);
          return { data: table === "connections" ? mocks.leads : [], error: null };
        }),
        maybeSingle: vi.fn(async () => ({
          data: table === "designers" ? { ...mocks.designer } : null,
          error: null,
        })),
        single: vi.fn(async () => ({
          data: table === "users" ? { role: mocks.role } : null,
          error: null,
        })),
        update: vi.fn((payload) => ({
          eq: vi.fn(async () => {
            mocks.mutations.push({ table, type: "update", payload });
            return { error: null };
          }),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(async () => {
            mocks.mutations.push({ table, type: "delete" });
            return { error: null };
          }),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => ({ data: { id: 901 }, error: null })),
          })),
        })),
        then: (resolve, reject) => Promise.resolve(
          query.isHeadCount
            ? {
              count: mocks.leads.filter((lead) => Object.entries(query.countFilters || {}).every(
                ([column, value]) => lead[column] === value
              )).length,
              error: null,
            }
            : { data: null, error: null }
        ).then(resolve, reject),
      };
      return query;
    });
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("shows only inquiry aggregates and never loads individual admin inquiry records", async () => {
    mocks.leads = [
      { ...mocks.leads[0], id: 501, status: "pending" },
      { ...mocks.leads[0], id: 502, status: "accepted" },
      { ...mocks.leads[0], id: 503, status: "on_hold" },
    ];
    renderWorkspace("/admin/manage-designer/29");

    expect(await screen.findByText("ADMIN OVERRIDE MODE: You are managing Studio One's profile.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Overview", exact: true })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Inquiries", exact: true })).not.toBeInTheDocument();
    expect(screen.queryByText("Inquiries & Clients")).not.toBeInTheDocument();
    expect(screen.queryByText("Client Example")).not.toBeInTheDocument();
    expect(screen.queryByText("client@example.com")).not.toBeInTheDocument();
    expect(screen.queryByText("+91-9000000000")).not.toBeInTheDocument();
    expect(screen.queryByText(/redesign the kitchen and dining area/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View Details" })).not.toBeInTheDocument();
    expect(screen.getByText("Total Inquiries")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Profile Views")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(mocks.from.mock.calls.filter(([table]) => table === "connections")).toEqual([]);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_count_designer_connections", { p_designer_id: 29 });
    expect(mocks.connectionOrders).toEqual([]);
    expect(mocks.mutations).toEqual([]);
  });

  it("shows Unavailable when the authorized admin count RPC fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "42501", message: "Unauthorized" } });
    renderWorkspace("/admin/manage-designer/29");

    expect(await screen.findByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(mocks.from.mock.calls.filter(([table]) => table === "connections")).toEqual([]);
    expect(mocks.rpc).toHaveBeenCalledWith("admin_count_designer_connections", { p_designer_id: 29 });
    expect(consoleError).toHaveBeenCalledWith(
      "Unable to count designer inquiries via the admin RPC:",
      "42501"
    );
    consoleError.mockRestore();
  });

  it("converts bigint-compatible RPC strings without accepting unsafe numbers", async () => {
    mocks.rpc.mockResolvedValue({ data: "3", error: null });
    const { unmount } = renderWorkspace("/admin/manage-designer/29");
    expect(await screen.findByText("3")).toBeInTheDocument();
    unmount();

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.rpc.mockResolvedValue({ data: "9007199254740992", error: null });
    renderWorkspace("/admin/manage-designer/29");
    expect(await screen.findByText("Unavailable")).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it("uses the same exact designer-scoped count for the designer metric across statuses", async () => {
    mocks.role = "designer";
    mocks.leads = [
      { ...mocks.leads[0], id: 501, status: "pending" },
      { ...mocks.leads[0], id: 502, status: "accepted" },
      { ...mocks.leads[0], id: 503, status: "on_hold" },
    ];
    renderWorkspace("/dashboard");

    expect(await screen.findByRole("heading", { name: "Inquiries & Clients" })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(mocks.connectionSelections).toContainEqual({ columns: "id", options: { count: "exact", head: true } });
    expect(mocks.connectionCountFilters).toEqual([{ column: "designer_id", value: 29 }]);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("keeps profile editing and portfolio management available in admin override", async () => {
    renderWorkspace("/admin/manage-designer/29");

    await screen.findByText("ADMIN OVERRIDE MODE: You are managing Studio One's profile.");
    fireEvent.click(screen.getByRole("button", { name: "Edit Profile", exact: true }));
    expect(await screen.findByRole("heading", { name: "Profile Settings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Portfolio", exact: true }));
    expect(await screen.findByRole("heading", { name: "Portfolio" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add Project", exact: true }));
    expect(await screen.findByText("Add New Project")).toBeInTheDocument();
  });

  it("preserves designer status and delete actions", async () => {
    vi.stubEnv("VITE_PHASE1A_INQUIRY_RPC_ENABLED", "true");
    mocks.role = "designer";
    renderWorkspace("/dashboard");

    expect(await screen.findByRole("heading", { name: "Inquiries & Clients" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View Details" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep on Hold" }));
    await waitFor(() => {
      expect(mocks.mutations).toContainEqual({
        table: "connections",
        type: "update",
        payload: expect.objectContaining({ status: "on_hold" }),
      });
    });
    expect(within(screen.getByRole("main")).getByText(/no new requests/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "On Hold", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "View Details" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete", exact: true }));
    await waitFor(() => {
      expect(mocks.rpc).toHaveBeenCalledWith("designer_archive_connection", { p_connection_id: 501 });
    });
    vi.unstubAllEnvs();
  });

  it("requires both the route target and authenticated admin role for override and mutation blocking", () => {
    expect(isAdminWorkspaceOverride({ designerRouteId: "29", authenticatedRole: "designer" })).toBe(false);
    expect(isAdminWorkspaceOverride({ designerRouteId: null, authenticatedRole: "admin" })).toBe(false);
    const adminOverride = isAdminWorkspaceOverride({ designerRouteId: "29", authenticatedRole: "admin" });
    expect(adminOverride).toBe(true);
  });

  it.each(["accepted", "delete"])("blocks a directly invoked %s handler in admin override mode", async (status) => {
    const mutateInquiry = vi.fn();
    const adminOverride = isAdminWorkspaceOverride({ designerRouteId: "29", authenticatedRole: "admin" });
    const handleStatusUpdate = createInquiryMutationHandler(adminOverride, mutateInquiry);

    await handleStatusUpdate(501, status);

    expect(mutateInquiry).not.toHaveBeenCalled();
  });

  it("does not treat a designer route ID as admin override without the authenticated admin role", async () => {
    mocks.role = "designer";
    renderWorkspace("/admin/manage-designer/29");

    expect(await screen.findByText("Home")).toBeInTheDocument();
    expect(screen.queryByText(/ADMIN OVERRIDE MODE/)).not.toBeInTheDocument();
    expect(mocks.connectionSelections).toEqual([]);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
