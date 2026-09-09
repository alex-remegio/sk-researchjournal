import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { getEdasService } from "@/lib/edas";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const paperId = request.nextUrl.searchParams.get("paperId") ?? "";
  return withAuth(
    request,
    async () => {
      z.string().min(1).parse(paperId);
      const paper = await getEdasService().lookupPaper(paperId);
      return json({ paper, mode: getEdasService().mode });
    },
    { csrf: false },
  );
}
