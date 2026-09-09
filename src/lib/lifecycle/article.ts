export const PUBLICATION_PIPELINE = [
  "DRAFT",
  "FOR_REVIEW",
  "READY_FOR_PUBLICATION",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export type PublicationStage = (typeof PUBLICATION_PIPELINE)[number];

const PIPELINE_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "For review",
  FOR_REVIEW: "For review",
  REVISION_REQUIRED: "For review",
  REVISED: "For review",
  FOR_APPROVAL: "Accepted",
  APPROVED: "Accepted",
  READY_FOR_PUBLICATION: "Accepted",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
  REJECTED: "Rejected",
};

export function pipelineStage(status: string): PublicationStage | "REJECTED" {
  if (["SUBMITTED", "FOR_REVIEW", "REVISION_REQUIRED", "REVISED"].includes(status)) {
    return "FOR_REVIEW";
  }
  if (["FOR_APPROVAL", "APPROVED", "READY_FOR_PUBLICATION"].includes(status)) {
    return "READY_FOR_PUBLICATION";
  }
  if ((PUBLICATION_PIPELINE as readonly string[]).includes(status)) {
    return status as PublicationStage;
  }
  if (status === "REJECTED") return "REJECTED";
  return "DRAFT";
}

export function formatArticleStatus(status: string) {
  return PIPELINE_LABELS[status] ?? status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function formatRecentArticleStatus(status: string) {
  if (pipelineStage(status) === "READY_FOR_PUBLICATION") return "Accepted";
  return formatArticleStatus(status);
}

export function queueStatuses(bucket: "DRAFT" | "READY_FOR_PUBLICATION" | "SCHEDULED") {
  if (bucket === "READY_FOR_PUBLICATION") return ["READY_FOR_PUBLICATION", "FOR_APPROVAL", "APPROVED"];
  return [bucket];
}

export function truncateArticleTitle(title: string, max = 18) {
  const clean = title.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(1, max - 3)).trimEnd()}...`;
}

export function isApprovedForPublication(status?: string | null, approvedAt?: Date | null) {
  if (approvedAt) return true;
  return ["READY_FOR_PUBLICATION", "SCHEDULED", "PUBLISHED", "APPROVED", "FOR_APPROVAL"].includes(
    status ?? "",
  );
}

export function isReadyToSchedule(status: string) {
  return pipelineStage(status) === "READY_FOR_PUBLICATION";
}

export function isReadyToPublish(status: string) {
  return status === "SCHEDULED" || isReadyToSchedule(status);
}
