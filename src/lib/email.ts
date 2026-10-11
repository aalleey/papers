import nodemailer from "nodemailer";
import { ClientUser, EmailRecord } from "./types";
import { db } from "./db";

// Base Site URL for clickable email CTA links
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "https://paperwala.world";
}

/**
 * Generates responsive, high-converting HTML Welcome Email tailored for Pakistani educators.
 */
export function generateWelcomeEmailHtml(client: ClientUser): string {
  const baseUrl = getBaseUrl();
  const sub = client.subscription;
  const academy = client.academyName || "Educator Academy";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PaperWala</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #0f172a; padding: 30px 10px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
    .header { background: linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%); padding: 36px 32px 30px; text-align: center; color: #ffffff; }
    .brand-logo { display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background: linear-gradient(135deg, #10b981, #06b6d4); font-size: 28px; font-weight: 900; color: #ffffff; margin-bottom: 12px; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.4); }
    .brand-name { font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
    .brand-urdu { font-size: 22px; color: #34d399; font-weight: normal; margin-top: 4px; }
    .tagline { font-size: 13px; color: #94a3b8; margin: 6px 0 0; }
    .body-content { padding: 36px 32px; background-color: #ffffff; }
    .greeting-urdu { background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; padding: 12px 18px; text-align: right; direction: rtl; font-size: 18px; color: #065f46; font-weight: bold; margin-bottom: 22px; }
    h1 { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0 0 14px; line-height: 1.3; }
    p { font-size: 14px; line-height: 1.65; color: #475569; margin: 0 0 16px; }
    .info-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px 22px; margin: 24px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 600; }
    .info-val { color: #0f172a; font-weight: 800; text-align: right; }
    .badge-plan { display: inline-block; padding: 3px 12px; border-radius: 999px; background-color: #d1fae5; color: #065f46; font-weight: 800; font-size: 12px; }
    .features-list { margin: 24px 0; padding: 0; list-style: none; }
    .features-list li { display: flex; align-items: flex-start; margin-bottom: 12px; font-size: 13px; color: #334155; line-height: 1.5; }
    .feature-icon { display: inline-block; min-width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 8px; background-color: #ecfdf5; color: #059669; font-weight: 900; margin-right: 12px; }
    .btn-container { text-align: center; margin: 32px 0 24px; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-weight: 800; font-size: 15px; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.4); }
    .btn-secondary { display: inline-block; background-color: #f1f5f9; color: #334155 !important; text-decoration: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 13px; margin: 8px 4px 0; border: 1px solid #cbd5e1; }
    .steps-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px 22px; margin: 26px 0; }
    .steps-box h3 { font-size: 14px; font-weight: 900; color: #166534; margin: 0 0 12px; }
    .steps-list { margin: 0; padding-left: 20px; font-size: 12px; color: #15803d; line-height: 1.7; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6; }
    .footer a { color: #059669; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="brand-logo">📚</div>
              <h1 class="brand-name">PaperWala</h1>
              <div class="brand-urdu">پیپر والا</div>
              <div class="tagline">Pakistan's #1 Board Exam &amp; Test Paper Generator</div>
            </div>

            <!-- Body -->
            <div class="body-content">
              <!-- Urdu Welcome Banner -->
              <div class="greeting-urdu">
                محترم اساتذہ کرام! خوش آمدید &bull; آپ کا اکاونٹ تیار ہے
              </div>

              <h1>Welcome to PaperWala, ${client.fullName}! 🎓</h1>
              <p>
                Congratulations! Your educator account for <strong>${academy}</strong> has been registered successfully. You now have access to Punjab Boards &amp; FBISE standard test questions, authentic Urdu Nastaliq typography, and instant examination paper maker.
              </p>

              <!-- Account Summary -->
              <div class="info-card">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr class="info-row">
                    <td class="info-label">Educator Name</td>
                    <td class="info-val">${client.fullName}</td>
                  </tr>
                  <tr class="info-row">
                    <td class="info-label">Registered Email</td>
                    <td class="info-val">${client.email}</td>
                  </tr>
                  <tr class="info-row">
                    <td class="info-label">Academy / School</td>
                    <td class="info-val">${academy}</td>
                  </tr>
                  ${client.phone ? `
                  <tr class="info-row">
                    <td class="info-label">Phone / WhatsApp</td>
                    <td class="info-val">${client.phone}</td>
                  </tr>` : ""}
                  <tr class="info-row">
                    <td class="info-label">Current Plan</td>
                    <td class="info-val"><span class="badge-plan">${sub.planName}</span></td>
                  </tr>
                </table>
              </div>

              <!-- Key Features Included -->
              <p><strong>What you can do right now with PaperWala:</strong></p>
              <ul class="features-list">
                <li>
                  <span class="feature-icon">✓</span>
                  <div><strong>Official Board Pairing Scheme:</strong> Strictly conforms to Punjab Boards (Lahore, Rawalpindi, Gujranwala, Multan, Faisalabad, etc.) and FBISE syllabus.</div>
                </li>
                <li>
                  <span class="feature-icon">✓</span>
                  <div><strong>Dual-Language Questions:</strong> Seamlessly print in English, authentic Noto Nastaliq Urdu (RTL), or Bilingual side-by-side format.</div>
                </li>
                <li>
                  <span class="feature-icon">✓</span>
                  <div><strong>Automated Answer Keys &amp; OMR:</strong> Generate complete MCQ answer keys with student roll-number bubble sheets in 1-click.</div>
                </li>
                <li>
                  <span class="feature-icon">✓</span>
                  <div><strong>4 Anti-Cheating Paper Codes:</strong> Print Version A, B, C, and D with scrambled question orders for cheat-proof hall exams.</div>
                </li>
              </ul>

              <!-- How to get started -->
              <div class="steps-box">
                <h3>🚀 3 Simple Steps to Generate Your First Paper:</h3>
                <ol class="steps-list">
                  <li>Visit the <strong>Question Bank</strong> and select your syllabus chapters (e.g. Class 10 Computer Science).</li>
                  <li>Pick your desired mix of <strong>MCQs, Short Questions, and Long Questions</strong>.</li>
                  <li>Click <strong>Print / Export</strong> to get a print-ready board exam paper with your academy header!</li>
                </ol>
              </div>

              <!-- Call to Action Buttons -->
              <div class="btn-container">
                <a href="${baseUrl}/select-questions?chapter=2" class="btn-primary" target="_blank">
                  Start Creating Exam Papers &rarr;
                </a>
                <div style="margin-top: 14px;">
                  <a href="${baseUrl}/profile" class="btn-secondary" target="_blank">
                    My Profile &amp; Paper History
                  </a>
                  <a href="${baseUrl}/pricing" class="btn-secondary" target="_blank">
                    Upgrade Subscription
                  </a>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin: 0 0 8px;">
                Need help or have questions? Contact us via WhatsApp or reply directly to this email.<br>
                Visit official portal: <a href="${baseUrl}">${baseUrl.replace(/^https?:\/\//, "")}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; 2026 PaperWala (پیپر والا). Made with ❤️ for Pakistani Educators and Academies.
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Sends the welcome email using Resend API (if configured), Nodemailer SMTP (if configured),
 * or gracefully logs to the server console and outbox store (Simulation Mode).
 */
export async function sendWelcomeEmail(client: ClientUser): Promise<SendEmailResult> {
  const subject = `Welcome to PaperWala (پیپر والا) - Pakistan's #1 Exam Paper Generator! 🎓`;
  const htmlContent = generateWelcomeEmailHtml(client);
  const previewText = `Welcome to PaperWala, ${client.fullName}! Your educator account for ${client.academyName || "your academy"} is ready.`;

  // 1. Try Resend REST API if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const from = process.env.EMAIL_FROM || "PaperWala <welcome@paperwala.world>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [client.email],
          subject,
          html: htmlContent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await db.saveEmail({
          to: client.email,
          recipientName: client.fullName,
          subject,
          template: "welcome",
          status: "sent",
          previewText,
          htmlContent,
          error: null,
        });
        console.log(`[EMAIL] Welcome email sent via Resend to ${client.email} (ID: ${data.id})`);
        return { success: true, messageId: data.id };
      } else {
        console.warn(`[EMAIL] Resend returned error:`, data);
      }
    } catch (err: unknown) {
      console.error(`[EMAIL] Failed to send via Resend:`, err);
    }
  }

  // 2. Try Nodemailer SMTP if SMTP_HOST is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = Number(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"PaperWala" <${process.env.SMTP_USER}>`,
        to: client.email,
        subject,
        html: htmlContent,
      });

      await db.saveEmail({
        to: client.email,
        recipientName: client.fullName,
        subject,
        template: "welcome",
        status: "sent",
        previewText,
        htmlContent,
        error: null,
      });

      console.log(`[EMAIL] Welcome email sent via SMTP to ${client.email} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "SMTP send error";
      console.error(`[EMAIL] Failed to send via SMTP:`, msg);
    }
  }

  // 3. Fallback / Dev Simulation Mode
  // Safely records email into the outbox database so it can be verified in tests and admin panel
  await db.saveEmail({
    to: client.email,
    recipientName: client.fullName,
    subject,
    template: "welcome",
    status: "simulated",
    previewText,
    htmlContent,
    error: null,
  });

  console.log(`--------------------------------------------------------------------------------`);
  console.log(`[EMAIL SIMULATED OUTBOX] Welcome Email Prepared for: ${client.email}`);
  console.log(`Recipient: ${client.fullName} (${client.academyName || "Academy"})`);
  console.log(`Subject: ${subject}`);
  console.log(`Status: Simulated (Configure RESEND_API_KEY or SMTP_HOST in .env.local for live delivery)`);
  console.log(`--------------------------------------------------------------------------------`);

  return { success: true, simulated: true };
}
