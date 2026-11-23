import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadToR2, deleteFromR2, resolveMediaUrl } from "../utils/r2Storage";
import { supabase } from "../services/supabaseClient";

vi.mock("../services/supabaseClient", () => {
  return {
    supabase: {
      functions: {
        invoke: vi.fn(),
      },
    },
  };
});

describe("r2Storage Utility Suite (Cloudflare R2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadToR2()", () => {
    it("throws when no file is provided", async () => {
      await expect(uploadToR2(null)).rejects.toThrow(/No file provided/i);
    });

    it("throws when file exceeds 10MB limit", async () => {
      const hugeFile = new File([new Uint8Array(10485761)], "huge.jpg", {
        type: "image/jpeg",
      });
      await expect(uploadToR2(hugeFile)).rejects.toThrow(/exceeds the 10MB limit/i);
    });

    it("throws when file has unsupported MIME type", async () => {
      const textFile = new File(["dummy text"], "notes.txt", {
        type: "text/plain",
      });
      await expect(uploadToR2(textFile)).rejects.toThrow(/unsupported MIME type/i);
    });

    it("calls get-r2-upload-url and performs direct presigned PUT fetch", async () => {
      const validFile = new File(["valid image binary"], "portfolio.webp", {
        type: "image/webp",
      });
      const mockPublicUrl = "https://pub-r2.vishwakarmans.com/portfolios/user-1/portfolio.webp";

      supabase.functions.invoke.mockResolvedValueOnce({
        data: {
          uploadUrl: "https://r2-upload.cloudflarestorage.com/presigned-put-url",
          publicUrl: mockPublicUrl,
          key: "portfolios/user-1/portfolio.webp",
        },
        error: null,
      });

      const fetchMock = vi.fn(() => Promise.resolve({ ok: true, status: 200 }));
      vi.stubGlobal("fetch", fetchMock);

      const resultUrl = await uploadToR2(validFile, "portfolios");

      expect(supabase.functions.invoke).toHaveBeenCalledWith("get-r2-upload-url", {
        body: {
          fileName: "portfolio.webp",
          contentType: "image/webp",
          folder: "portfolios",
          fileSize: validFile.size,
        },
      });

      expect(fetchMock).toHaveBeenCalledWith("https://r2-upload.cloudflarestorage.com/presigned-put-url", {
        method: "PUT",
        headers: {
          "Content-Type": "image/webp",
        },
        body: validFile,
      });

      expect(resultUrl).toBe(mockPublicUrl);
      vi.unstubAllGlobals();
    });
  });

  describe("deleteFromR2()", () => {
    it("returns null for falsy input without making requests", async () => {
      const res = await deleteFromR2(null);
      expect(res).toBeNull();
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it("invokes delete-r2-file with publicUrl when a full URL is provided", async () => {
      supabase.functions.invoke.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const url = "https://pub-r2.vishwakarmans.com/logos/user-1/logo.png";
      await deleteFromR2(url);

      expect(supabase.functions.invoke).toHaveBeenCalledWith("delete-r2-file", {
        body: { publicUrl: url },
      });
    });

    it("invokes delete-r2-file with key when a raw key is provided", async () => {
      supabase.functions.invoke.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      await deleteFromR2("logos/user-1/logo.png");

      expect(supabase.functions.invoke).toHaveBeenCalledWith("delete-r2-file", {
        body: { key: "logos/user-1/logo.png" },
      });
    });

    it("handles an array of items with Promise.allSettled", async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await deleteFromR2([
        "https://pub-r2.vishwakarmans.com/portfolios/u-1/img1.webp",
        "https://pub-r2.vishwakarmans.com/portfolios/u-1/img2.webp",
      ]);

      expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
    });
  });

  describe("resolveMediaUrl()", () => {
    it("returns empty string for empty or non-string inputs", () => {
      expect(resolveMediaUrl("")).toBe("");
      expect(resolveMediaUrl(null)).toBe("");
      expect(resolveMediaUrl(undefined)).toBe("");
    });

    it("returns absolute URLs (http, https, blob, data) unmodified", () => {
      expect(resolveMediaUrl("https://pub-r2.vishwakarmans.com/img.webp")).toBe(
        "https://pub-r2.vishwakarmans.com/img.webp"
      );
      expect(resolveMediaUrl("http://example.com/logo.png")).toBe(
        "http://example.com/logo.png"
      );
      expect(resolveMediaUrl("blob:http://localhost:5173/uuid")).toBe(
        "blob:http://localhost:5173/uuid"
      );
    });

    it("falls back cleanly for relative legacy paths", () => {
      const resolved = resolveMediaUrl("designer-1/room.webp");
      expect(resolved).toBeTruthy();
      expect(resolved).toContain("designer-1/room.webp");
    });
  });
});
