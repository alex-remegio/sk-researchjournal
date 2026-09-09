import { env } from "@/lib/env";
import type { EmailMessage, EmailMode, EmailService, SentEmail } from "@/lib/email/types";

export class MockEmailService implements EmailService {
  mode = "mock" as const;
  private sent: SentEmail[] = [];

  async send(message: EmailMessage): Promise<SentEmail> {
    const record: SentEmail = {
      ...message,
      id: `mock-${this.sent.length + 1}`,
      source: this.mode,
      sentAt: new Date().toISOString(),
    };
    this.sent.push(record);
    if (env.NODE_ENV !== "test") {
      console.info(`[email:mock] to=${record.to} subject=${record.subject}`);
    }
    return { ...record };
  }

  list() {
    return this.sent.map((item) => ({ ...item }));
  }

  reset() {
    this.sent = [];
  }
}

export class LiveEmailService implements EmailService {
  mode = "live" as const;

  constructor(
    private readonly config: {
      apiKey: string;
      from: string;
      apiUrl: string;
    },
  ) {}

  private configured() {
    return Boolean(this.config.apiKey && this.config.from);
  }

  async send(message: EmailMessage): Promise<SentEmail> {
    if (!this.configured()) {
      throw new Error(
        "Email live mode is not configured. Set EMAIL_FROM and RESEND_API_KEY.",
      );
    }
    const response = await fetch(this.config.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.config.from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html ?? message.text.replaceAll("\n", "<br/>"),
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Email send failed (${response.status}): ${body.slice(0, 300)}`);
    }
    const data = (await response.json().catch(() => ({}))) as { id?: string };
    return {
      ...message,
      id: data.id ?? `live-${Date.now()}`,
      source: this.mode as EmailMode,
      sentAt: new Date().toISOString(),
    };
  }
}
