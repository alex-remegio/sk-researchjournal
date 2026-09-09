import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { listMyReviewAssignments } from "@/lib/services/review";

export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async ({ user }) => json({ assignments: await listMyReviewAssignments(user.id) }),
    { csrf: false },
  );
}
