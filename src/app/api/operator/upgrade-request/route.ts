import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getOperator } from "@/lib/auth/get-operator";
import { logOperatorContact } from "@/lib/db/queries/operators";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFY_EMAILS = ["support@partyboatsusa.com", "support@gofishvip.com"];

export async function POST(request: NextRequest) {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const hasGoFish = body.hasGoFishAccount === true;

  // Log the upgrade request
  await logOperatorContact({
    operatorId: operator.id,
    eventType: "upgrade_request",
    context: {
      hasGoFishAccount: hasGoFish,
      currentTier: operator.tier?.name || "Basic",
      companyName: operator.companyName,
      contactName: operator.contactName,
      email: operator.email,
      phone: operator.phone,
    },
    note: hasGoFish
      ? "Operator has GoFish account, ready to link"
      : "Operator needs GoFish setup, schedule demo",
  });

  // Send notification email to admin
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>",
      to: NOTIFY_EMAILS,
      subject: `Pro Upgrade Request - ${operator.companyName}`,
      html: `
        <h2>New Pro Upgrade Request</h2>
        <p><strong>Company:</strong> ${operator.companyName}</p>
        <p><strong>Contact:</strong> ${operator.contactName}</p>
        <p><strong>Email:</strong> ${operator.email}</p>
        <p><strong>Phone:</strong> ${operator.phone || "Not provided"}</p>
        <p><strong>Has GoFish Account:</strong> ${hasGoFish ? "Yes, ready to link" : "No, needs demo"}</p>
        <p><strong>Current Tier:</strong> ${operator.tier?.name || "Basic"}</p>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send upgrade notification email:", emailError);
    // Don't fail the request - the log was saved
  }

  return NextResponse.json({ success: true });
}
