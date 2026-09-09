import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { canManageUsers } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { UserAdminForm } from "@/components/admin/UserAdminForm";

export default async function AdminUsersPage() {
  const user = await requireSession();
  if (!canManageUsers(user)) redirect("/admin");
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: { assignments: { include: { journal: true } } },
    orderBy: { createdAt: "desc" },
  });
  const journals = await prisma.journal.findMany({ where: { deletedAt: null }, select: { id: true, name: true } });
  return (
    <div>
      <h1 className="font-serif text-3xl">Users</h1>
      <ul className="mt-6 divide-y rounded border bg-white">
        {users.map((item) => (
          <li key={item.id} className="p-4">
            <p>
              {item.name} · {item.email} · {item.role} · {item.active ? "Active" : "Suspended"}
            </p>
            <p className="text-sm text-ink-600">
              {item.assignments.map((assignment) => `${assignment.journal.name} (${assignment.role})`).join("; ")}
            </p>
          </li>
        ))}
      </ul>
      <UserAdminForm journals={journals} />
    </div>
  );
}
