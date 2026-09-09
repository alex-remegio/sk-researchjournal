import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { getReviewPacket } from "@/lib/services/review";
import { ReviewerForm } from "@/components/admin/ReviewerForm";
import { displayName } from "@/lib/services/authors";

export default async function ReviewerAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const user = await requireSession();
  const assignment = await prisma.reviewAssignment.findUnique({
    where: { id: assignmentId },
    include: { report: true },
  });
  if (!assignment || assignment.reviewerId !== user.id) notFound();
  const packet = await getReviewPacket(assignment.articleId, user);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase text-crimson-700">Single-blind review</p>
        <h1 className="font-serif text-3xl">{packet.title}</h1>
        <p className="mt-2 text-ink-700">
          Authors:{" "}
          {packet.authors
            .map((link: { author: { firstName: string; lastName: string } }) => displayName(link.author))
            .join(", ")}
        </p>
        <p className="mt-1 text-sm text-ink-500">Your name will not be shown to the authors.</p>
      </div>
      <section className="rounded border bg-white p-5">
        <h2 className="font-serif text-xl">Abstract</h2>
        <div className="mt-3 leading-7" dangerouslySetInnerHTML={{ __html: packet.abstract }} />
      </section>
      <ReviewerForm
        assignmentId={assignment.id}
        status={assignment.status}
        existing={assignment.report}
      />
    </div>
  );
}
