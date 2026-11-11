const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

export const PUBLIC_DESIGNER_PROFILE_COLUMNS = [
  "id",
  "user_id",
  "name",
  "city",
  "email",
  "phone",
  "designer_type",
  "about_text",
  "logo_url",
  "style_tags",
  "experience_years",
  "is_verified",
  "is_public",
  "is_subscription_active",
  "subscription_end",
  "featured_status",
  "projects_completed",
  "rating_avg",
  "website_url",
  "videos_approved",
].join(", ");

export const PUBLIC_DESIGNER_CARD_COLUMNS = [
  "id",
  "name",
  "city",
  "designer_type",
  "about_text",
  "logo_url",
  "style_tags",
  "experience_years",
  "is_verified",
  "is_public",
  "is_subscription_active",
  "subscription_end",
  "featured_status",
  "featured_expiry",
  "priority_score",
  "projects_completed",
  "rating_avg",
  "service_area_lat",
  "service_area_lng",
].join(", ");

export const getYouTubeEmbedUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !YOUTUBE_HOSTS.has(url.hostname.toLowerCase())
    ) {
      return null;
    }

    let videoId = null;
    if (url.hostname.toLowerCase() === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] || null;
    } else if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else {
      videoId = url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})\/?$/)?.[1] || null;
    }

    if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
};

export const extractYouTubeVideoId = (value) => {
  const embed = getYouTubeEmbedUrl(value);
  if (!embed) return null;
  return embed.split("/").pop() || null;
};

export const loadPublicDesignerVideo = async (supabase, designerId) => {
  const id = Number(designerId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { embedUrl: null, error: null };
  }

  const { data, error } = await supabase.rpc("get_public_designer_video", {
    p_designer_id: id,
  });

  if (error) return { embedUrl: null, error };
  return { embedUrl: getYouTubeEmbedUrl(data), error: null };
};
