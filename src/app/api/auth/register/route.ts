import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { operators, membershipTiers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema } from "@/lib/validations/operator";
import { logOperatorContact } from "@/lib/db/queries/operators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, companyName, contactName, phone } = parsed.data;

    // Check if operator email already exists
    const [existing] = await db
      .select({ id: operators.id })
      .from(operators)
      .where(eq(operators.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "operator" },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Look up Basic tier to auto-assign
    const [basicTier] = await db
      .select({ id: membershipTiers.id })
      .from(membershipTiers)
      .where(eq(membershipTiers.name, "Basic"))
      .limit(1);

    // Create operator row in database with Basic tier
    const [operator] = await db
      .insert(operators)
      .values({
        authUserId: authData.user.id,
        email,
        companyName,
        contactName,
        phone: phone || null,
        membershipTierId: basicTier?.id ?? null,
      })
      .returning();

    // Log CRM event (fire and forget)
    logOperatorContact({
      operatorId: operator.id,
      eventType: "registration",
      context: { email, companyName },
    }).catch(() => {});

    return NextResponse.json({ success: true, operator });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
