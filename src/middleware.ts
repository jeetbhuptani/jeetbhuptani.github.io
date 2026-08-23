import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

/**
 * Refreshes the Supabase auth session cookie on /admin requests.
 *
 * Without this, an expired access token is only noticed inside a Server
 * Component — which cannot write cookies — so the admin would silently bounce
 * to the login screen mid-session. Scoped to /admin by the matcher below so it
 * costs nothing on public pages.
 */
export async function middleware(request: NextRequest) {
  // Read through config.ts so the new publishable-key name and the legacy
  // anon-key name are both honoured here, exactly as they are elsewhere.
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touching getUser() is what triggers the refresh; the result is unused here
  // because authorisation happens in the page/route via getAdminState().
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
