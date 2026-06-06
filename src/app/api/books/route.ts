import { getCurrentlyReading } from "@/lib/books";

// Slow-moving data — cache for a day. Secret (Hardcover token) stays server-side.
export const revalidate = 86400;

export async function GET() {
  const result = await getCurrentlyReading();
  return Response.json(result);
}
