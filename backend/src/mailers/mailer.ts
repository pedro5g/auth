import { config } from "../config/app-config";
import { resend } from "./resend-client";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
}

const mailer_sender =
  config.NODE_ENV === "dev"
    ? `no-reply <onboarding@resend.dev>`
    : `no-reply <${config.MAILER_SENDER}>`;

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from = mailer_sender,
}: SendEmailParams) {
  return await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    text,
    subject,
    html,
  });
}
