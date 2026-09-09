import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { getReviewPacket } from "@/lib/services/review";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(
    request,
    async ({ user }) => json({ packet: await getReviewPacket(id, user) }),
    { csrf: false },
  );
}
