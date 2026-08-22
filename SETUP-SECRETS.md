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
GITHUB_TOKEN=
```

## 2. Hardcover (books)

For the "currently reading" shelf.

1. Log in at https://hardcover.app → https://hardcover.app/account/api .
2. Copy the bearer token shown at the top (it may already include `Bearer ` — keep just the token part).

```
HARDCOVER_API_TOKEN=
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
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
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
   `jeetbhuptani.tech` A-record to `76.76.21.21` and `www` to `cname.vercel-dns.com` →
   remove the old GitHub Pages records). We do **not** touch DNS until the new site is
   verified on a preview URL.

---

## 6. Supabase (content DB + /admin auth) — **do this next**

You already created the org + project and connected the repo. Three things left:
apply the schema, mint the keys, create your admin user.

### 6a. Apply the schema

The repo connection deploys migrations **on push to the connected branch**. The work
is on `feat/cms-admin-pages`, which isn't merged yet — so the fastest path is to run
it by hand once:

1. Dashboard → **SQL Editor** → **New query**.
2. Paste the whole of `supabase/migrations/20260822000000_content_schema.sql`.
3. **Run**. You should get `Success. No rows returned`.
4. Check **Table Editor** — you should see `work_entries`, `life_entries`, `skills`,
   `book_overrides`, each showing an **RLS enabled** badge.

> The file is already named in Supabase's required `<YYYYMMDDHHmmss>_<name>.sql`
> format, so once this branch merges the integration will treat it as already applied
> rather than trying to run it twice.

### 6b. Get the keys

Dashboard → **Project Settings** → **API Keys**.

| Dashboard value | Env var | Exposure |
| --- | --- | --- |
| Project URL (`https://<ref>.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` | public |
| **Publishable key** (`sb_publishable_…`) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public — fine, RLS protects the data |
| **Secret key** (`sb_secret_…`) | `SUPABASE_SECRET_KEY` | **server only — never `NEXT_PUBLIC_`** |

Use the **new** publishable/secret keys, not the legacy `anon` / `service_role` pair on
the "Legacy API Keys" tab — those are deprecated at the end of 2026. The code reads the
legacy names as a fallback too, so if the Vercel↔Supabase integration auto-injects
`NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` instead, it still works.

> If you ever paste the secret key somewhere public, rotate it immediately in the same
> screen. It bypasses RLS completely — it is the one credential here that matters.

### 6c. Create your admin user

Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**.

- Email: the one you'll sign in with. Put the *same* value in `ADMIN_EMAIL`.
- Password: a real one, from your password manager.
- Tick **Auto Confirm User** — otherwise it waits on an email you haven't configured SMTP for.

Then **Authentication → Sign In / Providers → Email** and turn **"Allow new users to
sign up"** *off*. One account is the entire user base; leaving signup on means anyone
can create a row in `auth.users`. They still couldn't get into `/admin` — `ADMIN_EMAIL`
is checked separately — but there's no reason to allow it.

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
ADMIN_EMAIL=you@example.com
```

### 6d. First sign-in (2FA enrollment)

Run `pnpm dev`, open <http://localhost:3000/admin>:

1. Sign in with the email + password from 6c.
2. You'll land on **Set up 2FA** → **Generate QR code**.
3. Scan with Google Authenticator / 1Password / Authy, enter the 6-digit code.
4. You're in. Every later session asks for a code but not the QR again.

**Save the secret string shown under the QR** in your password manager. There are no
recovery codes yet — if you lose the authenticator, the only way back is deleting the
factor from the Supabase dashboard.

---

## 7. Cloudinary (photos + video for /life)

Free tier: **25 credits/month, no credit card**. One credit = 1GB storage *or* 1GB
video bandwidth *or* 1,000 transformations. For a photo wall that is a lot of headroom.

1. Sign up at <https://cloudinary.com/users/register_free>.
2. Dashboard landing page → **Product Environment Credentials**. You need three:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=   # "Cloud name" — public, appears in every image URL
CLOUDINARY_API_KEY=                  # server only
CLOUDINARY_API_SECRET=               # server only — click the eye icon to reveal
```

3. That's it — no upload preset to configure. Uploads are **signed server-side** by
   `/api/admin/upload-signature`, so there is no public write endpoint on your media
   account. Files go browser → Cloudinary directly, which is what keeps videos viable.

> The code always requests `f_auto,q_auto` and an explicit width, so a 4000px phone
> photo is never delivered at full size to a 400px card. That is the difference between
> 25 credits lasting years and lasting a month.

---

## 8. Putting the values in

**Local:** append everything to `.env.local` (already gitignored). Restart `pnpm dev` —
Next only reads env at boot.

**Production:** Vercel → Project → Settings → Environment Variables. Add each for
**Production + Preview**, then redeploy — Vercel bakes `NEXT_PUBLIC_*` values in at
build time, so an existing deployment will not pick them up.

Sanity check after deploying: `/admin` should show the sign-in form rather than the
"Supabase isn't configured yet" message.

---

### `.env.local` template

See `.env.example` for the full annotated list. Short version:

```
GITHUB_TOKEN=
HARDCOVER_API_TOKEN=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ADMIN_EMAIL=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Ping me whichever you've got and I'll wire those widgets up live; the rest render
graceful empty states until their token lands.
