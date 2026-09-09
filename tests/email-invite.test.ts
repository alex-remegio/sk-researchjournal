import { describe, expect, it, beforeEach } from "vitest";
import { MockEmailService } from "@/lib/email/implementations";
import { sendAccountInvite, sendReviewAssignmentNotice } from "@/lib/email/notify";
import { getEmailService, getMockEmailService, resetEmailForTests } from "@/lib/email";

describe("reviewer invite email", () => {
  beforeEach(() => {
    resetEmailForTests();
  });

  it("sends a login invite with email and temporary password", async () => {
    const sent = await sendAccountInvite({
      name: "Alex Remegio",
      email: "alexremegio@gmail.com",
      password: "DevPassword123!",
      role: "REVIEWER",
    });
    expect(sent?.to).toBe("alexremegio@gmail.com");
    expect(sent?.subject).toMatch(/editorial login/i);
    expect(sent?.text).toContain("http://localhost:3000/login");
    expect(sent?.text).toContain("alexremegio@gmail.com");
    expect(sent?.text).toContain("DevPassword123!");
    expect(getMockEmailService()?.list()).toHaveLength(1);
  });

  it("notifies a reviewer when a manuscript is assigned", async () => {
    const sent = await sendReviewAssignmentNotice({
      reviewerName: "Alex Remegio",
      reviewerEmail: "alexremegio@gmail.com",
      articleTitle: "Artificial Intelligence Integration in Higher Education",
      journalName: "Journal of Computing and Technology",
      assignmentId: "assign-1",
      dueDate: new Date("2026-10-01"),
    });
    expect(sent?.to).toBe("alexremegio@gmail.com");
    expect(sent?.subject).toMatch(/Review invitation/i);
    expect(sent?.text).toContain("/admin/reviews/assign-1");
    expect(sent?.text).toContain("2026-10-01");
  });

  it("stores mock messages without calling a remote API", async () => {
    const email = getEmailService() as MockEmailService;
    expect(email.mode).toBe("mock");
    await email.send({ to: "a@example.com", subject: "Test", text: "Hello" });
    expect(getMockEmailService()?.list()[0]?.subject).toBe("Test");
  });
});
