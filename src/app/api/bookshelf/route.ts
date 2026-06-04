import { getBookshelf } from "@/lib/books";

export const revalidate = 3600;

export async function GET() {
  return Response.json(await getBookshelf());
}
