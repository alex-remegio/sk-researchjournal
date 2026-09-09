import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import {
  canAssignReviewers,
  canMakeEditorialDecision,
  canScreenManuscript,
} from "@/lib/auth/rbac";
import { canTransition } from "@/lib/validation/publish";
import { anonymizeReviewerLabel, redactReviewPacket } from "@/lib/services/review";
import type { SessionUser } from "@/lib/auth/session";

function user(role: Role, assignments: SessionUser["assignments"] = []): SessionUser {
  return {
    id: "u1",
    name: "Test",
    email: "test@example.com",
    role,
    active: true,
    assignments,
  };
}

describe("single-blind review workflow", () => {
  const journalId = "j1";

  it("follows the JTET-style status path", () => {
    expect(canTransition("DRAFT", "SUBMITTED")).toBe(true);
    expect(canTransition("SUBMITTED", "FOR_REVIEW")).toBe(true);
    expect(canTransition("SUBMITTED", "REJECTED")).toBe(true);
    expect(canTransition("FOR_REVIEW", "REVISION_REQUIRED")).toBe(true);
    expect(canTransition("REVISION_REQUIRED", "REVISED")).toBe(true);
    expect(canTransition("REVISED", "FOR_REVIEW")).toBe(true);
    expect(canTransition("FOR_REVIEW", "READY_FOR_PUBLICATION")).toBe(true);
    expect(canTransition("FOR_REVIEW", "PUBLISHED")).toBe(false);
    expect(canTransition("READY_FOR_PUBLICATION", "SCHEDULED")).toBe(true);
    expect(canTransition("SCHEDULED", "PUBLISHED")).toBe(true);
  });

  it("lets associate editors screen and assign, but only EIC decide", () => {
    const eic = user(Role.EDITOR_IN_CHIEF, [{ journalId, role: Role.EDITOR_IN_CHIEF, categoryId: null }]);
    const managing = user(Role.MANAGING_EDITOR, [{ journalId, role: Role.MANAGING_EDITOR, categoryId: null }]);
    expect(canScreenManuscript(managing, journalId)).toBe(true);
    expect(canAssignReviewers(eic, journalId)).toBe(true);
    expect(canMakeEditorialDecision(managing, journalId)).toBe(false);
    expect(canMakeEditorialDecision(eic, journalId)).toBe(true);
  });

  it("labels reviewers anonymously for authors", () => {
    expect(anonymizeReviewerLabel(0)).toBe("Reviewer 1");
    expect(anonymizeReviewerLabel(1)).toBe("Reviewer 2");
  });

  it("does not expose reviewer identities or editor-only comments to authors", () => {
    const author = user(Role.AUTHOR);
    author.id = "author1";
    const redacted = redactReviewPacket(
      {
        id: "a1",
        journalId,
        createdById: "author1",
        title: "Manuscript",
        abstract: "Abstract",
        status: "FOR_REVIEW",
        authors: [],
        files: [],
        journal: { name: "Journal" },
        editorialDecisions: [],
        reviewRounds: [
          {
            id: "round1",
            roundNumber: 1,
            assignments: [
              {
                id: "as1",
                reviewerId: "rev1",
                status: "COMPLETED",
                dueDate: null,
                completedAt: null,
                reviewer: {
                  id: "rev1",
                  name: "Secret Reviewer",
                  email: "reviewer@example.com",
                  role: "REVIEWER",
                },
                report: {
                  recommendation: "ACCEPT",
                  originality: "original",
                  significance: "significant",
                  methodology: "sound",
                  clarity: "clear",
                  commentsToAuthor: "Please clarify section 2.",
                  commentsToEditor: "Weak statistics.",
                  submittedAt: new Date(),
                },
              },
            ],
            decisions: [],
            revisions: [],
          },
        ],
      } as never,
      author,
    );
    expect("reviewRounds" in redacted).toBe(false);
    expect(redacted.rounds[0].assignments[0].label).toBe("Reviewer 1");
    expect(redacted.rounds[0].assignments[0].reviewer.email).toBeNull();
    expect(redacted.rounds[0].assignments[0].report?.commentsToEditor).toBeNull();
    expect(redacted.rounds[0].assignments[0].report?.commentsToAuthor).toContain("clarify");
  });
});
