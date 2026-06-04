import { getBookshelf } from "@/lib/books";

export const revalidate = 86400;

export async function GET() {
  return Response.json(await getBookshelf());
}
