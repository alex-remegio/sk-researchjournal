import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { screenManuscript, submitForScreening } from "@/lib/services/review";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const body = await request.json();
    if (body.action === "SUBMIT") {
      const article = await submitForScreening(id, user, meta);
      return json({ article });
    }
    const article = await screenManuscript(id, body, user, meta);
    return json({ article });
  });
}
