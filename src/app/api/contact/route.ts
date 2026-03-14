import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildContactFormEmail } from "@/lib/email/templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "support@partyboatsusa.com";
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const html = buildContactFormEmail({ name, email, subject, message });

    await resend.emails.send({
      from: EMAIL_FROM,
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
