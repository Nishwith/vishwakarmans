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
  mutations: [],
  from: vi.fn(),
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
    mocks.mutations = [];
    mocks.from.mockImplementation((table) => {
      const query = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        order: vi.fn(async () => ({
          data: table === "connections" ? mocks.leads : [],
          error: null,
        })),
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
      };
      return query;
    });
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("lets an admin inspect inquiry details but hides status and delete controls", async () => {
    renderWorkspace("/admin/manage-designer/29");

    expect(await screen.findByText("ADMIN OVERRIDE MODE: You are managing Studio One's profile.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Inquiries & Clients" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View Details" }));

    expect(screen.getByText(/redesign the kitchen and dining area/i)).toBeInTheDocument();
    const clientRecord = screen.getByText("Client Example");
    expect(clientRecord).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept Active" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Keep on Hold" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete", exact: true })).not.toBeInTheDocument();
    expect(mocks.mutations).toEqual([]);
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
      expect(mocks.mutations).toContainEqual({ table: "connections", type: "delete" });
    });
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
});
