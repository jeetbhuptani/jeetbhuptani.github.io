/**
 * Spotify now-playing (plan U11/R17). Server-side only: a long-lived refresh
 * token (env) is exchanged for a short access token per request batch; secrets
 * never reach the client. Fallback chain: now-playing → recently-played →
 * top-tracks, so the widget is never empty when there's listening history.
 */

export type Track = {
  title: string;
  artist: string;
  album?: string;
  url: string;
  image?: string;
  isPlaying: boolean;
};

export type SpotifyResult = {
  status: "ok" | "empty" | "error";
  mode: "now" | "recent" | "top" | "none";
  track: Track | null;
};

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";
const TOP = "https://api.spotify.com/v1/me/top/tracks?limit=1";

// ---- pure normalizer ----

export function normalizeTrack(item: any, isPlaying: boolean): Track | null {
  if (!item?.name) return null;
  return {
    title: item.name,
    artist: (item.artists ?? []).map((a: any) => a.name).join(", ") || "Unknown",
    album: item.album?.name,
    url: item.external_urls?.spotify ?? "https://open.spotify.com",
    image: item.album?.images?.[item.album.images.length - 1]?.url ?? item.album?.images?.[0]?.url,
    isPlaying,
  };
}

// ---- network ----

async function getAccessToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!id || !secret || !refresh) return null;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }).toString(),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.access_token ?? null;
}

export async function getSpotify(): Promise<SpotifyResult> {
  const token = await getAccessToken();
  if (!token) return { status: "empty", mode: "none", track: null };
  const auth = { Authorization: `Bearer ${token}` };

  try {
    // 1. Now playing (204 = nothing playing — no body).
    const now = await fetch(NOW, { headers: auth, next: { revalidate: 30 } });
    if (now.status === 200) {
      const data = await now.json();
      const track = normalizeTrack(data.item, data.is_playing ?? false);
      if (track?.isPlaying) return { status: "ok", mode: "now", track };
    }
    // 2. Recently played.
    const recent = await fetch(RECENT, { headers: auth, next: { revalidate: 300 } });
    if (recent.ok) {
      const data = await recent.json();
      const track = normalizeTrack(data.items?.[0]?.track, false);
      if (track) return { status: "ok", mode: "recent", track };
    }
    // 3. Top track.
    const top = await fetch(TOP, { headers: auth, next: { revalidate: 3600 } });
    if (top.ok) {
      const data = await top.json();
      const track = normalizeTrack(data.items?.[0], false);
      if (track) return { status: "ok", mode: "top", track };
    }
    return { status: "empty", mode: "none", track: null };
  } catch {
    return { status: "error", mode: "none", track: null };
  }
}
