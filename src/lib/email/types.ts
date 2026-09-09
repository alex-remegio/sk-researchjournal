/**
 * Outbound email for editorial invites and review assignments.
 *
 *   EMAIL_MODE=mock  — store messages in memory (development / tests)
 *   EMAIL_MODE=live  — send via Resend HTTP API
 */

export type EmailMode = "mock" | "live";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type SentEmail = EmailMessage & {
  id: string;
  source: EmailMode;
  sentAt: string;
};

export interface EmailService {
  mode: EmailMode;
  send(message: EmailMessage): Promise<SentEmail>;
}
