import { NextRequest, NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { claimRequests, boats } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getOperatorClaimRequests, logOperatorContact } from "@/lib/db/queries/operators";
import { claimRequestSchema } from "@/lib/validations/operator";

export async function GET() {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const claims = await getOperatorClaimRequests(operator.id);
  return NextResponse.json(claims);
}

export async function POST(request: NextRequest) {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = claimRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Verify boat exists and is unclaimed
  const boat = await db
    .select({ id: boats.id, name: boats.name })
    .from(boats)
    .where(and(eq(boats.id, parsed.data.boatId), isNull(boats.operatorId)))
    .limit(1);

  if (boat.length === 0) {
    return NextResponse.json(
      { error: "Boat not found or already claimed" },
      { status: 400 }
    );
  }

  const [claim] = await db
    .insert(claimRequests)
    .values({
      boatId: parsed.data.boatId,
      operatorId: operator.id,
      message: parsed.data.message || null,
    })
    .returning();

  logOperatorContact({
    operatorId: operator.id,
    eventType: "claim_request",
    context: { boatId: parsed.data.boatId, boatName: boat[0].name },
  }).catch(() => {});

  return NextResponse.json(claim, { status: 201 });
}
