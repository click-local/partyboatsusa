import { NextResponse } from "next/server";
import { getOperator } from "@/lib/auth/get-operator";
import { getOperatorSubmissions } from "@/lib/db/queries/operators";

export async function GET() {
  const operator = await getOperator();
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await getOperatorSubmissions(operator.id);
  return NextResponse.json(submissions);
}
