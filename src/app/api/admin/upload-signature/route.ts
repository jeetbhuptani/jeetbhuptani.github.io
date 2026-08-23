import { NextResponse, type NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { AdminAuthError, requireAdmin } from "@/lib/supabase/auth";

/**
 * Issues a short-lived Cloudinary upload signature.
 *
 * Signed uploads rather than an unsigned preset: an unsigned preset embedded in
 * the client is a public write endpoint on the media account, and the free tier
 * has a hard credit ceiling. Here the API secret never leaves the server and a
 * signature is only minted for a 2FA-verified admin.
 *
 * The caller passes a content hash of the file it is about to send, which
 * becomes the asset's public_id. Uploading the same photo twice then overwrites
 * one asset instead of creating a second copy — previously every re-pick of the
 * same file burned another slot of the free-tier quota, which is exactly what
 * happened in practice.
 */

export const dynamic = "force-dynamic";

/** Content hashes only. This value is concatenated into the asset path, so a
 *  loose pattern here would let an admin token write outside `folder`. */
const PUBLIC_ID_RE = /^[a-f0-9]{16,64}$/;

const FOLDER = "portfolio/life";

export async function POST(req: NextRequest) {
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

  const body = await req.json().catch(() => null);
  const publicId: unknown = body?.publicId;
  if (typeof publicId !== "string" || !PUBLIC_ID_RE.test(publicId)) {
    return NextResponse.json(
      { error: "publicId must be a 16–64 character lowercase hex content hash" },
      { status: 422 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Every one of these is signed, so an admin token cannot be replayed to
  // scatter uploads across the account or to overwrite an arbitrary asset.
  const params = {
    folder: FOLDER,
    public_id: publicId,
    overwrite: true,
    // Without this, an overwrite keeps serving the old bytes from the CDN.
    invalidate: true,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  return NextResponse.json({ cloudName, apiKey, ...params, signature });
}
