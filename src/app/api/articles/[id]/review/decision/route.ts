import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { recordEditorialDecision } from "@/lib/services/review";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const article = await recordEditorialDecision(id, await request.json(), user, meta);
    return json({ article });
  });
}
