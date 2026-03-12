#!/usr/bin/env node
/**
 * Create Initial Admin User
 * Uses Supabase Admin API to create an admin user in auth.users
 *
 * Usage: node scripts/create-admin.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const ADMIN_EMAIL = "brandon@clicklocal.agency";
const ADMIN_PASSWORD = "PartyBoats2025admin!";
const ADMIN_NAME = "Brandon";

async function createAdmin() {
  console.log("Creating admin user...");
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  URL: ${SUPABASE_URL}`);

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        name: ADMIN_NAME,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    if (data.msg?.includes("already been registered") || data.message?.includes("already been registered")) {
      console.log("\n⚠ Admin user already exists. Updating metadata...");
      // List users to find the existing one
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        headers: {
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
      const listData = await listRes.json();
      const existing = listData.users?.find((u) => u.email === ADMIN_EMAIL);
      if (existing) {
        // Update user metadata to ensure role is admin
        const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existing.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            user_metadata: { role: "admin", name: ADMIN_NAME },
          }),
        });
        if (updateRes.ok) {
          console.log("✓ Admin metadata updated successfully");
        }
      }
      return;
    }
    console.error("Failed to create admin:", data);
    process.exit(1);
  }

  console.log(`\n✓ Admin user created successfully!`);
  console.log(`  ID: ${data.id}`);
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`\n  Login at: http://localhost:3000/admin/login`);
}

createAdmin().catch(console.error);
