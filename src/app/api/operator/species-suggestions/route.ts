import { NextRequest, NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { speciesSuggestions } from "@/lib/db/schema";
import { speciesSuggestionSchema } from "@/lib/validations";
import { Resend } from "resend";
import { buildSpeciesSuggestionEmail } from "@/lib/email/templates";
import { rateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 5, windowMs: 60_000, prefix: "species-suggest" });
  if (limited) return limited;

  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = speciesSuggestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { speciesName, commonNames, notes } = parsed.data;

    const [suggestion] = await db
      .insert(speciesSuggestions)
      .values({
        operatorId: operator.id,
        speciesName,
        commonNames: commonNames || null,
        notes: notes || null,
      })
      .returning();

    // Send notification emails (fire-and-forget)
    const html = buildSpeciesSuggestionEmail({
      speciesName,
      commonNames,
      notes,
      operatorName: operator.companyName,
      operatorEmail: operator.email,
    });

    resend.emails
      .send({
        from: EMAIL_FROM,
        to: ["support@partyboatsusa.com", "support@gofishvip.com"],
        subject: `New Species Suggestion: ${speciesName}`,
        html,
      })
      .catch(() => {});

    return NextResponse.json(suggestion, { status: 201 });
  } catch (error) {
    console.error("Species suggestion error:", error);
    return NextResponse.json({ error: "Failed to submit suggestion" }, { status: 500 });
  }
}
