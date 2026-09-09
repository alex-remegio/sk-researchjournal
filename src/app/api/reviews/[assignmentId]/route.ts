import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { respondToInvitation, submitReviewReport } from "@/lib/services/review";
import { z } from "zod";

type Params = { params: Promise<{ assignmentId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { assignmentId } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const body = await request.json();
    if (body.invitation) {
      const accept = z.boolean().parse(body.accept);
      const assignment = await respondToInvitation(assignmentId, accept, user);
      return json({ assignment });
    }
    const report = await submitReviewReport(assignmentId, body, user, meta);
    return json({ report }, 201);
  });
}
