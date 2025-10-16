/**
 * utils/emailer.ts
 * Unified email sender using Resend API for MyGiveAway.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = "no-reply@mygiveaway.app"; // You can adjust this in Resend dashboard
const APP_URL = "https://mygiveaway.vercel.app";

/**
 * Generic email sender through Resend.
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email body (HTML)
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `MyGiveAway <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Resend Email Error:", errorText);
      throw new Error(`Email failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Email Sent:", data);
    return data;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    throw error;
  }
}

/**
 * Sends a Welcome Email to new users.
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const subject = "🎉 Welcome to MyGiveAway!";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Welcome, ${name}!</h2>
      <p>We’re thrilled to have you join <strong>MyGiveAway</strong> — the platform where every giveaway supports a cause.</p>
      <p>Start exploring: <a href="${APP_URL}" style="color: #4f46e5;">${APP_URL}</a></p>
      <br/>
      <p>Stay active, participate, and win giveaways that delight and give back!</p>
      <p>— The MyGiveAway Team 💙</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
}

/**
 * Sends a Password Reset Email.
 */
export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const subject = "🔑 Reset Your MyGiveAway Password";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h3>Password Reset Request</h3>
      <p>We received a request to reset your password.</p>
      <p>You can reset it using the link below:</p>
      <a href="${resetLink}" style="color: #4f46e5; text-decoration: none;">Reset Password</a>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <br/>
      <p>— The MyGiveAway Team</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
}

/**
 * Sends a Custom Notification Email (for Admin alerts, events, etc.).
 */
export async function sendCustomEmail(
  to: string,
  subject: string,
  message: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h3>${subject}</h3>
      <p>${message}</p>
      <br/>
      <p>— The MyGiveAway Team</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
}
