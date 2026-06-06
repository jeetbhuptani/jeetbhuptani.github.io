import { getSpotify } from "@/lib/spotify";

// Short window — now-playing is near-real-time. Client polls slower than this so
// polls hit warm CDN cache instead of multiplying upstream calls (plan U11).
export const revalidate = 30;

export async function GET() {
  return Response.json(await getSpotify());
}
