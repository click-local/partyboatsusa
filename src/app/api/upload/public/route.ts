import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Simple in-memory rate limiter
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = uploadAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    uploadAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File size must be under 5MB" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `public/${uuidv4()}.${ext}`;

  const { error } = await supabase.storage
    .from("brag-board")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Public upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }

  const { data: urlData } = supabase.storage
    .from("brag-board")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}
