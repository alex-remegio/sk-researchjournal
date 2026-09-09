import { env } from "@/lib/env";
import { getEmailService } from "@/lib/email";
import type { SentEmail } from "@/lib/email/types";

function loginUrl() {
  return `${env.APP_URL.replace(/\/$/, "")}/login`;
}

function reviewsUrl(assignmentId?: string) {
  const base = `${env.APP_URL.replace(/\/$/, "")}/admin/reviews`;
  return assignmentId ? `${base}/${assignmentId}` : base;
}

export async function sendAccountInvite(params: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<SentEmail | null> {
  const roleLabel = params.role.replaceAll("_", " ").toLowerCase();
  const subject = `Your ${env.APP_NAME} editorial login`;
  const text = [
    `Hello ${params.name},`,
    "",
    `An account has been created for you on ${env.APP_NAME} as ${roleLabel}.`,
    "",
    `Sign in: ${loginUrl()}`,
    `Email: ${params.email}`,
    `Temporary password: ${params.password}`,
    "",
    "Please sign in and change your password after your first login if your editor asks you to.",
    "",
    `— ${env.APP_NAME}`,
  ].join("\n");
  try {
    return await getEmailService().send({
      to: params.email,
      subject,
      text,
      html: `<p>Hello ${escapeHtml(params.name)},</p>
<p>An account has been created for you on <strong>${escapeHtml(env.APP_NAME)}</strong> as ${escapeHtml(roleLabel)}.</p>
<p><a href="${loginUrl()}">Sign in to the editorial portal</a></p>
<p>Email: <code>${escapeHtml(params.email)}</code><br/>Temporary password: <code>${escapeHtml(params.password)}</code></p>
<p>Please sign in promptly. Keep this message private.</p>
<p>— ${escapeHtml(env.APP_NAME)}</p>`,
    });
  } catch (error) {
    console.error("[email] invite failed", error);
    return null;
  }
}

export async function sendReviewAssignmentNotice(params: {
  reviewerName: string;
  reviewerEmail: string;
  articleTitle: string;
  journalName: string;
  assignmentId: string;
  dueDate?: Date | null;
}): Promise<SentEmail | null> {
  const due = params.dueDate ? params.dueDate.toISOString().slice(0, 10) : null;
  const subject = `Review invitation: ${params.articleTitle}`;
  const text = [
    `Hello ${params.reviewerName},`,
    "",
    `You have been invited to review a manuscript for ${params.journalName}.`,
    "",
    `Title: ${params.articleTitle}`,
    due ? `Due date: ${due}` : null,
    "",
    `Open your assignment: ${reviewsUrl(params.assignmentId)}`,
    `Or sign in at: ${loginUrl()}`,
    "",
    `— ${env.APP_NAME}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
  try {
    return await getEmailService().send({
      to: params.reviewerEmail,
      subject,
      text,
      html: `<p>Hello ${escapeHtml(params.reviewerName)},</p>
<p>You have been invited to review a manuscript for <strong>${escapeHtml(params.journalName)}</strong>.</p>
<p><strong>Title:</strong> ${escapeHtml(params.articleTitle)}${due ? `<br/><strong>Due date:</strong> ${due}` : ""}</p>
<p><a href="${reviewsUrl(params.assignmentId)}">Open your review assignment</a></p>
<p>Sign in: <a href="${loginUrl()}">${loginUrl()}</a></p>
<p>— ${escapeHtml(env.APP_NAME)}</p>`,
    });
  } catch (error) {
    console.error("[email] assignment notice failed", error);
    return null;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
