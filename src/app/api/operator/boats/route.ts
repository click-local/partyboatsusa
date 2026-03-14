import { NextRequest, NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { boatSubmissions } from "@/lib/db/schema";
import { getOperatorBoats, logOperatorContact } from "@/lib/db/queries/operators";
import { boatSubmissionSchema } from "@/lib/validations/operator";
import { Resend } from "resend";
import { buildBoatSubmissionNotificationEmail } from "@/lib/email/templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";
const ADMIN_EMAILS = [
  "support@partyboatsusa.com",
  "support@gofishvip.com",
];

export async function GET() {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boats = await getOperatorBoats(operator.id);
  return NextResponse.json(boats);
}

export async function POST(request: NextRequest) {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = boatSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const [submission] = await db
    .insert(boatSubmissions)
    .values({
      operatorId: operator.id,
      ...parsed.data,
    })
    .returning();

  logOperatorContact({
    operatorId: operator.id,
    eventType: "boat_submission",
    context: { boatName: parsed.data.name, submissionId: submission.id },
  }).catch(() => {});

  // Send notification email (fire-and-forget)
  const html = buildBoatSubmissionNotificationEmail({
    boatName: parsed.data.name,
    operatorName: parsed.data.operatorName || operator.companyName,
    operatorEmail: operator.email,
    cityName: parsed.data.cityName,
    stateCode: parsed.data.stateCode,
    capacity: parsed.data.capacity,
    phone: parsed.data.phone,
    websiteUrl: parsed.data.websiteUrl,
  });

  resend.emails
    .send({
      from: EMAIL_FROM,
      to: ADMIN_EMAILS,
      subject: `New Boat Submission: ${parsed.data.name} - ${parsed.data.cityName}, ${parsed.data.stateCode}`,
      html,
    })
    .catch(() => {});

  return NextResponse.json(submission, { status: 201 });
}
