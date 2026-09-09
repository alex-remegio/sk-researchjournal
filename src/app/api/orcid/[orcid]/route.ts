import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/guard";
import { json } from "@/lib/http";
import { getOrcidService } from "@/lib/orcid";
import { NotFoundError } from "@/lib/errors";

export async function GET(request: NextRequest, context: { params: Promise<{ orcid: string }> }) {
  return withAuth(request, async () => {
    const { orcid } = await context.params;
    const person = await getOrcidService().lookup(decodeURIComponent(orcid));
    if (!person) throw new NotFoundError("ORCID record not found");
    return json({ person });
  });
}
