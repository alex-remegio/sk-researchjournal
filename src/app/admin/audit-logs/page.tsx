import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { canViewAuditLogs } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";

export default async function AuditLogsPage() {
  const user = await requireSession();
  if (!canViewAuditLogs(user)) redirect("/admin");
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <div>
      <h1 className="font-serif text-3xl">Audit logs</h1>
      <div className="mt-6 overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-100">
            <tr>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-3 py-2">{log.createdAt.toISOString()}</td>
                <td className="px-3 py-2">{log.user?.email ?? "system"}</td>
                <td className="px-3 py-2">{log.action}</td>
                <td className="px-3 py-2">
                  {log.entityType} {log.entityId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
