// One-shot helper to mint a Spotify refresh token for the now-playing widget.
//
// Usage:
//   1. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local
//   2. In the Spotify dashboard, set the app's Redirect URI to
//      http://127.0.0.1:8888/callback  (exactly — 127.0.0.1, not localhost)
//   3. Run:  node scripts/spotify-auth.mjs
//   4. Open the printed URL, approve, and copy the refresh token it prints.
//
// No secrets are stored by this script; it only reads .env.local and prints.

import http from "node:http";
import { readFileSync } from "node:fs";

function loadEnvLocal() {
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/\s+#.*$/, "").trim();
    }
  } catch {
    /* no .env.local — rely on process env */
  }
}
loadEnvLocal();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT = "http://127.0.0.1:8888/callback";
const SCOPE = "user-read-currently-playing user-read-recently-played user-top-read";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("✗ Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local first.");
  process.exit(1);
}

const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT,
    scope: SCOPE,
  }).toString();

console.log("\n1) Open this URL in your browser and click Agree:\n\n" + authUrl + "\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (!url.pathname.startsWith("/callback")) {
    res.end("waiting…");
    return;
  }
  const code = url.searchParams.get("code");
  if (!code) {
    res.end("No code in callback.");
    return;
  }
  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT,
      }).toString(),
    });
    const data = await tokenRes.json();
    if (data.refresh_token) {
      console.log(
        "\n✅ Your refresh token (paste into .env.local as SPOTIFY_REFRESH_TOKEN=):\n\n" +
          data.refresh_token +
          "\n"
      );
      res.end("Done — refresh token printed in your terminal. You can close this tab.");
    } else {
      console.error("\n✗ No refresh_token in response:\n", data, "\n");
      res.end("Error — check your terminal.");
    }
  } catch (e) {
    console.error(e);
    res.end("Error — check your terminal.");
  } finally {
    server.close();
  }
});

server.listen(8888, "127.0.0.1", () =>
  console.log("2) Waiting for the redirect on http://127.0.0.1:8888/callback …\n")
);
