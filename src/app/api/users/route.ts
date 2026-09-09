import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { assignUserToJournal, createUser, listUsers, updateUser } from "@/lib/services/users";
import { assertPermission, canManageUsers } from "@/lib/auth/rbac";
import { assignmentSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async ({ user }) => {
      assertPermission(canManageUsers(user));
      return json({ users: await listUsers() });
    },
    { csrf: false },
  );
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, meta }) => {
    assertPermission(canManageUsers(user));
    const created = await createUser(await request.json(), user, meta);
    return json({ user: created }, 201);
  });
}

export async function PATCH(request: NextRequest) {
  return withAuth(request, async ({ user, meta }) => {
    assertPermission(canManageUsers(user));
    const body = await request.json();
    if (body.assignment) {
      const input = assignmentSchema.parse(body.assignment);
      const assignment = await assignUserToJournal({ ...input, actor: user, requestMeta: meta });
      return json({ assignment });
    }
    const updated = await updateUser(body.id, body, user, meta);
    return json({ user: updated });
  });
}
