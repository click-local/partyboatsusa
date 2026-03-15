import { NextRequest, NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { db } from "@/lib/db";
import { boats, boatFaqs } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { boatFaqBulkSchema } from "@/lib/validations";

async function verifyOwnership(operatorId: number, boatId: number) {
  const [boat] = await db
    .select({ id: boats.id })
    .from(boats)
    .where(and(eq(boats.id, boatId), eq(boats.operatorId, operatorId)));
  return !!boat;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!operator.tier?.isHighestTier) {
    return NextResponse.json({ error: "Pro tier required" }, { status: 403 });
  }

  const { id } = await params;
  const boatId = parseInt(id, 10);
  if (isNaN(boatId)) {
    return NextResponse.json({ error: "Invalid boat ID" }, { status: 400 });
  }

  const owns = await verifyOwnership(operator.id, boatId);
  if (!owns) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 });
  }

  const faqs = await db
    .select({
      id: boatFaqs.id,
      question: boatFaqs.question,
      answer: boatFaqs.answer,
      sortOrder: boatFaqs.sortOrder,
    })
    .from(boatFaqs)
    .where(eq(boatFaqs.boatId, boatId))
    .orderBy(asc(boatFaqs.sortOrder));

  return NextResponse.json(faqs);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!operator.tier?.isHighestTier) {
    return NextResponse.json({ error: "Pro tier required" }, { status: 403 });
  }

  const { id } = await params;
  const boatId = parseInt(id, 10);
  if (isNaN(boatId)) {
    return NextResponse.json({ error: "Invalid boat ID" }, { status: 400 });
  }

  const owns = await verifyOwnership(operator.id, boatId);
  if (!owns) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = boatFaqBulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const { faqs } = parsed.data;

  // Delete all existing FAQs then re-insert (bulk replace pattern)
  await db.delete(boatFaqs).where(eq(boatFaqs.boatId, boatId));

  if (faqs.length > 0) {
    await db.insert(boatFaqs).values(
      faqs.map((faq) => ({
        boatId,
        question: faq.question,
        answer: faq.answer,
        sortOrder: faq.sortOrder,
      }))
    );
  }

  // Return updated list
  const updated = await db
    .select({
      id: boatFaqs.id,
      question: boatFaqs.question,
      answer: boatFaqs.answer,
      sortOrder: boatFaqs.sortOrder,
    })
    .from(boatFaqs)
    .where(eq(boatFaqs.boatId, boatId))
    .orderBy(asc(boatFaqs.sortOrder));

  return NextResponse.json(updated);
}
