import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { AdminAuthError, requireAdmin } from "@/lib/supabase/auth";

/**
 * Issues a short-lived Cloudinary upload signature.
 *
 * Signed uploads rather than an unsigned preset: an unsigned preset embedded in
 * the client is a public write endpoint on the media account, and the free tier
 * has a hard credit ceiling. Here the API secret never leaves the server and a
 * signature is only minted for a 2FA-verified admin.
 */

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json(
        { error: err.reason },
        { status: err.reason === "anonymous" ? 401 : 403 }
      );
    }
    throw err;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "cloudinary not configured" }, { status: 503 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  // `folder` is part of the signed payload, so an admin token cannot be
  // repurposed to scatter uploads across the account.
  const folder = "portfolio/life";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    apiSecret
  );

  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
