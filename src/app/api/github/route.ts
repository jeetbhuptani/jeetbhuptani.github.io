import { getGithub } from "@/lib/github";

export const revalidate = 86400;

export async function GET() {
  return Response.json(await getGithub());
}
