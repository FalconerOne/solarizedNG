// lib/resend.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender (set via environment variable)
const FROM_EMAIL = process.env.EMAIL_FROM || "MyGiveAway <noreply@mygiveaway.app>";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email sent:", data?.id || "no ID");
    return data;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}
