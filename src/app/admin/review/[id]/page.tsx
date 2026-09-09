import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getReviewPacket, listPotentialReviewers } from "@/lib/services/review";
import { canMakeEditorialDecision, canScreenManuscript } from "@/lib/auth/rbac";
import { ReviewDesk } from "@/components/admin/ReviewDesk";

export default async function ReviewDeskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession();
  let packet;
  try {
    packet = await getReviewPacket(id, user);
  } catch {
    notFound();
  }
  if (packet.viewerRole === "other") redirect("/admin");
  const canScreen = canScreenManuscript(user, packet.journalId);
  const canDecide = canMakeEditorialDecision(user, packet.journalId);
  const reviewers = canScreen ? await listPotentialReviewers(packet.journalId) : [];
  return (
    <ReviewDesk
      packet={JSON.parse(JSON.stringify(packet))}
      reviewers={reviewers}
      canScreen={canScreen}
      canDecide={canDecide}
    />
  );
}
