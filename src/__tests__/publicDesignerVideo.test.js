import assert from "node:assert/strict";
import { test } from "vitest";
import {
  getYouTubeEmbedUrl,
  loadPublicDesignerVideo,
  PUBLIC_DESIGNER_CARD_COLUMNS,
  PUBLIC_DESIGNER_PROFILE_COLUMNS,
} from "../utils/publicDesignerVideo.js";

test("public profile projection excludes original video submissions", () => {
  assert.match(PUBLIC_DESIGNER_PROFILE_COLUMNS, /\bid\b/);
  assert.doesNotMatch(PUBLIC_DESIGNER_PROFILE_COLUMNS, /video_link/);
  assert.doesNotMatch(PUBLIC_DESIGNER_PROFILE_COLUMNS, /video_link_2/);
});

test("public designer card projection excludes contact and original video fields", () => {
  assert.match(PUBLIC_DESIGNER_CARD_COLUMNS, /\bid\b/);
  assert.match(PUBLIC_DESIGNER_CARD_COLUMNS, /\bfeatured_expiry\b/);
  assert.doesNotMatch(PUBLIC_DESIGNER_CARD_COLUMNS, /video_link/);
  assert.doesNotMatch(PUBLIC_DESIGNER_CARD_COLUMNS, /\b(email|phone|user_id|location)\b/);
});

test("converts allowed YouTube URL forms to an embed URL", () => {
  const cases = [
    ["https://www.youtube.com/watch?v=abcdefghijk&t=4", "https://www.youtube.com/embed/abcdefghijk"],
    ["https://m.youtube.com/shorts/abcdefghijk", "https://www.youtube.com/embed/abcdefghijk"],
    ["https://youtu.be/abcdefghijk", "https://www.youtube.com/embed/abcdefghijk"],
  ];

  for (const [url, expected] of cases) {
    assert.equal(getYouTubeEmbedUrl(url), expected);
  }
});

test("rejects missing or non-YouTube final URLs", () => {
  const invalidUrls = [
    null,
    undefined,
    "",
    "http://youtube.com/watch?v=abcdefghijk",
    "https://youtube.com.evil.example/watch?v=abcdefghijk",
    "https://vimeo.com/123456",
    "javascript:alert(1)",
    "https://youtube.com/watch?v=short",
  ];

  for (const url of invalidUrls) {
    assert.equal(getYouTubeEmbedUrl(url), null);
  }
});

test("requests only the public final video for the selected designer", async () => {
  const calls = [];
  const rpc = async (...args) => {
    calls.push(args);
    return { data: "https://youtu.be/abcdefghijk", error: null };
  };

  assert.deepEqual(await loadPublicDesignerVideo({ rpc }, "29"), {
    embedUrl: "https://www.youtube.com/embed/abcdefghijk",
    error: null,
  });
  assert.deepEqual(calls, [["get_public_designer_video", { p_designer_id: 29 }]]);
});

test("hides the section when the RPC has no published video or returns an error", async () => {
  const noVideoRpc = async () => ({ data: null, error: null });
  const rpcError = { code: "42883", message: "function unavailable" };
  const failedRpc = async () => ({ data: null, error: rpcError });

  assert.deepEqual(await loadPublicDesignerVideo({ rpc: noVideoRpc }, 29), {
    embedUrl: null,
    error: null,
  });
  assert.deepEqual(await loadPublicDesignerVideo({ rpc: failedRpc }, 29), {
    embedUrl: null,
    error: rpcError,
  });
});

test("does not call the RPC for an invalid designer ID", async () => {
  let callCount = 0;
  const rpc = async () => {
    callCount += 1;
    return { data: null, error: null };
  };

  assert.deepEqual(await loadPublicDesignerVideo({ rpc }, "invalid"), {
    embedUrl: null,
    error: null,
  });
  assert.equal(callCount, 0);
});

test("safely handles malformed and edge-case URLs without throwing exceptions", () => {
  const malformed = [
    "not-a-url",
    "https://",
    "https://youtube.com",
    "https://youtube.com/watch",
    "https://youtube.com/watch?v=",
    "https://youtu.be/",
    "https://www.youtube.com/embed/",
    "ftp://youtube.com/watch?v=12345678901",
  ];
  for (const item of malformed) {
    assert.doesNotThrow(() => {
      const res = getYouTubeEmbedUrl(item);
      assert.equal(res, null);
    });
  }
});
