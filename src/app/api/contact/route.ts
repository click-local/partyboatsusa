import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildContactFormEmail } from "@/lib/email/templates";
import { contactFormSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "support@partyboatsusa.com";
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 5, windowMs: 60_000, prefix: "contact" });
  if (limited) return limited;

  try {
    const body = await request.json();

    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { name, email, subject, message } = parsed.data;

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
