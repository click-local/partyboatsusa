import { NextRequest, NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { boatSubmissions } from "@/lib/db/schema";
import { getOperatorBoats, logOperatorContact } from "@/lib/db/queries/operators";
import { boatSubmissionSchema } from "@/lib/validations/operator";

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

  return NextResponse.json(submission, { status: 201 });
}
