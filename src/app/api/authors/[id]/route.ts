import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { getAuthorById, updateAuthor } from "@/lib/services/authors";
import { assertPermission, canEditAuthorProfile, canManageAuthors } from "@/lib/auth/rbac";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async () => json({ author: await getAuthorById(id) }), { csrf: false });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const existing = await getAuthorById(id);
    assertPermission(canEditAuthorProfile(user, existing), "You cannot edit this author profile");
    const body = (await request.json()) as Record<string, unknown>;
    if (!canManageAuthors(user)) delete body.userId;
    const author = await updateAuthor(id, body, user, meta);
    return json({ author });
  });
}
