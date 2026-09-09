import { env } from "@/lib/env";
import { LiveEmailService, MockEmailService } from "@/lib/email/implementations";
import type { EmailService } from "@/lib/email/types";

let instance: EmailService | null = null;
let mockInstance: MockEmailService | null = null;

export function getEmailService(): EmailService {
  if (instance) return instance;
  if (env.EMAIL_MODE === "live") {
    instance = new LiveEmailService({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      apiUrl: env.RESEND_API_URL,
    });
  } else {
    mockInstance = new MockEmailService();
    instance = mockInstance;
  }
  return instance;
}

export function getMockEmailService(): MockEmailService | null {
  getEmailService();
  return mockInstance;
}

export function resetEmailForTests() {
  instance = null;
  mockInstance = null;
}

export type { EmailService, SentEmail, EmailMessage } from "@/lib/email/types";
