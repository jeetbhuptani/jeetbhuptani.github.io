# Setup: secrets & Vercel (do this in parallel with the build)

These unlock the live widgets + the hosting migration. Each value becomes a
**server-only** environment variable in Vercel (never prefixed `NEXT_PUBLIC_`).
Collect them into a local `.env.local` for dev, and paste the same into Vercel →
Project → Settings → Environment Variables when we deploy.

---

## 1. GitHub (easiest — start here)

For the contributions graph + pinned repos.

1. https://github.com/settings/tokens?type=beta → **Generate new token (fine-grained)**.
2. Resource owner: your account. Repository access: **Public repositories (read-only)**.
   No extra account permissions needed for public contributions.
3. Copy the token.

```
GITHUB_TOKEN=github_pat_xxx
```

## 2. Hardcover (books)

For the "currently reading" shelf.

1. Log in at https://hardcover.app → https://hardcover.app/account/api .
2. Copy the bearer token shown at the top (it may already include `Bearer ` — keep just the token part).

```
HARDCOVER_API_TOKEN=xxx
```

> Note: Hardcover tokens expire ~yearly (reset Jan 1). Set a reminder to refresh.

## 3. Spotify (now playing) — the multi-step one

You mint a **refresh token once**; it then lasts indefinitely.

1. https://developer.spotify.com/dashboard → **Create app**.
   - Redirect URI: **`http://127.0.0.1:8888/callback`** (must be `127.0.0.1`, not
     `localhost`, and not a public `http://` URL — Spotify's 2025 OAuth rules).
   - Copy the **Client ID** and **Client Secret**.
2. Tell me when you have those two — I'll give you a tiny one-shot script that opens
   the auth page, you approve, and it prints your **refresh token**.

```
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx
SPOTIFY_REFRESH_TOKEN=xxx   # minted via the script in step 2
```

## 4. Instagram (optional / decide later)

Default is **token-free embeds** (you pick which posts show) — needs nothing here.
Only if you want the *live auto-updating* creator feed:

- It needs a Meta app + Instagram Graph API + a 60-day token refreshed by a cron
  (stored in Vercel KV). More maintenance. We can decide when we reach that widget.

```
# only if going live:
INSTAGRAM_ACCESS_TOKEN=xxx
```

---

## 5. Vercel (hosting migration)

1. Sign up / log in at https://vercel.com (free Hobby) with your GitHub account.
2. **Add New → Project** → import `jeetbhuptani.github.io`. Don't deploy to the live
   domain yet — a preview deploy is enough until the rebuild is ready.
3. Paste all the env vars above into Settings → Environment Variables (Production + Preview).
4. **DNS comes last**, and I'll walk you through it step by step (lower TTL → add the
   domain in Vercel → wait for "Valid Configuration" + SSL → only then repoint the
   `jeetbhuptani.me` A-record to `76.76.21.21` and `www` to `cname.vercel-dns.com` →
   remove the old GitHub Pages records). We do **not** touch DNS until the new site is
   verified on a preview URL.

---

### `.env.local` template

```
GITHUB_TOKEN=
HARDCOVER_API_TOKEN=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
# INSTAGRAM_ACCESS_TOKEN=
```

Ping me whichever you've got and I'll wire those widgets up live; the rest render
graceful empty states until their token lands.
