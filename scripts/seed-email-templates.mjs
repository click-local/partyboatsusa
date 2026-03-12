#!/usr/bin/env node
/**
 * Seed Email Templates
 * Inserts standard email templates into the database.
 *
 * Usage: node scripts/seed-email-templates.mjs
 * Requires: DATABASE_URL in .env.local
 */

import pg from "pg";
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

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

const templates = [
  {
    name: "Welcome - Operator Registration",
    description: "Sent to new operators when they register an account",
    subject: "Welcome to Party Boats USA, {{operatorName}}!",
    trigger: "on_operator_registration",
    recipients: "operator",
    body: `<h2>Welcome aboard, {{operatorName}}!</h2>
<p>Thanks for joining Party Boats USA — the premier directory for party boat fishing charters across the country.</p>
<p>Here's what you can do next:</p>
<ul>
  <li><strong>Complete your profile</strong> — Add your business details so customers can find you</li>
  <li><strong>Submit your boats</strong> — List your fleet with photos, pricing, and trip details</li>
  <li><strong>Explore upgrade options</strong> — Boost your visibility with a premium listing</li>
</ul>
<p>Log in to your Captain Portal anytime at <a href="{{siteUrl}}/operator/dashboard">{{siteUrl}}/operator/dashboard</a></p>
<p>If you have any questions, don't hesitate to reach out.</p>
<p>Tight lines!<br/>The Party Boats USA Team</p>`,
  },
  {
    name: "Operator - Email Verification",
    description: "Sent to verify an operator's email address after registration",
    subject: "Verify your email — Party Boats USA",
    trigger: "on_email_verification",
    recipients: "operator",
    body: `<h2>Verify your email address</h2>
<p>Hi {{operatorName}},</p>
<p>Please confirm your email address by clicking the link below:</p>
<p><a href="{{verificationUrl}}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Verify Email</a></p>
<p>If you didn't create an account on Party Boats USA, you can safely ignore this email.</p>
<p>— The Party Boats USA Team</p>`,
  },
  {
    name: "Operator - Password Reset",
    description: "Sent when an operator requests a password reset",
    subject: "Reset your password — Party Boats USA",
    trigger: "on_password_reset",
    recipients: "operator",
    body: `<h2>Password Reset Request</h2>
<p>Hi {{operatorName}},</p>
<p>We received a request to reset your password. Click the link below to set a new one:</p>
<p><a href="{{resetUrl}}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Reset Password</a></p>
<p>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
<p>— The Party Boats USA Team</p>`,
  },
  {
    name: "Boat Submission - Confirmation",
    description: "Sent to operator when they submit a new boat listing for review",
    subject: "Boat submission received — {{boatName}}",
    trigger: "on_boat_submission",
    recipients: "operator",
    body: `<h2>Submission Received!</h2>
<p>Hi {{operatorName}},</p>
<p>We've received your boat listing submission for <strong>{{boatName}}</strong>.</p>
<p>Our team will review your listing and get it published as quickly as possible. You'll receive an email once it's been approved.</p>
<p>In the meantime, you can track your submission status in your <a href="{{siteUrl}}/operator/dashboard">Captain Portal</a>.</p>
<p>— The Party Boats USA Team</p>`,
  },
  {
    name: "Boat Submission - Approved",
    description: "Sent to operator when their boat listing is approved and published",
    subject: "Your boat is live! — {{boatName}}",
    trigger: "on_boat_approved",
    recipients: "operator",
    body: `<h2>Your listing is live! 🎉</h2>
<p>Hi {{operatorName}},</p>
<p>Great news — your boat listing for <strong>{{boatName}}</strong> has been approved and is now live on Party Boats USA!</p>
<p><a href="{{boatUrl}}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">View Your Listing</a></p>
<p>Tips to get more visibility:</p>
<ul>
  <li>Add high-quality photos to your gallery</li>
  <li>Keep your pricing and availability up to date</li>
  <li>Encourage happy customers to leave reviews</li>
  <li>Consider upgrading to a premium tier for featured placement</li>
</ul>
<p>— The Party Boats USA Team</p>`,
  },
  {
    name: "Boat Submission - Rejected",
    description: "Sent to operator when their boat listing is rejected",
    subject: "Update needed for your boat listing — {{boatName}}",
    trigger: "on_boat_rejected",
    recipients: "operator",
    body: `<h2>Listing Update Needed</h2>
<p>Hi {{operatorName}},</p>
<p>We've reviewed your submission for <strong>{{boatName}}</strong> and need a few changes before we can publish it.</p>
<p><strong>Reason:</strong> {{rejectionReason}}</p>
<p>Please update your listing in your <a href="{{siteUrl}}/operator/dashboard">Captain Portal</a> and resubmit when ready.</p>
<p>If you have questions, feel free to reply to this email.</p>
<p>— The Party Boats USA Team</p>`,
  },
  {
    name: "Claim Request - Confirmation",
    description: "Sent to operator when they submit a claim request for an existing listing",
    subject: "Claim request received — {{boatName}}",
    trigger: "on_claim_submitted",
    recipients: "operator",
    body: `<h2>Claim Request Received</h2>
<p>Hi {{operatorName}},</p>
<p>We've received your request to claim the listing for <strong>{{boatName}}</strong>.</p>
<p>Our team will verify your ownership and get back to you within 1-2 business days. You may be asked to provide documentation to confirm you operate this vessel.</p>
<p>— The Party Boats USA Team</p>`,
  },
  {
    name: "Claim Request - Approved",
    description: "Sent to operator when their claim request is approved",
    subject: "Claim approved — {{boatName}} is now yours!",
    trigger: "on_claim_approved",
    recipients: "operator",
    body: `<h2>Claim Approved!</h2>
<p>Hi {{operatorName}},</p>
<p>Your claim for <strong>{{boatName}}</strong> has been approved. You now have full control of this listing.</p>
<p>You can edit your boat details, update photos, and manage your listing from your <a href="{{siteUrl}}/operator/dashboard">Captain Portal</a>.</p>
<p>— The Party Boats USA Team</p>`,
  },
  {
    name: "New Review Notification",
    description: "Sent to operator when a customer leaves a review on their boat",
    subject: "New review on {{boatName}} — {{rating}} stars",
    trigger: "on_new_review",
    recipients: "operator",
    body: `<h2>New Review!</h2>
<p>Hi {{operatorName}},</p>
<p>A customer left a <strong>{{rating}}-star review</strong> on your listing for <strong>{{boatName}}</strong>:</p>
<blockquote style="border-left:4px solid #2563eb;padding:8px 16px;margin:16px 0;background:#f8fafc;">
  <strong>{{reviewTitle}}</strong><br/>
  "{{reviewComment}}"<br/>
  <em>— {{reviewerName}}</em>
</blockquote>
<p>View all your reviews in your <a href="{{siteUrl}}/operator/dashboard">Captain Portal</a>.</p>
<p>— The Party Boats USA Team</p>`,
  },
  {
    name: "Contact Form - Admin Notification",
    description: "Sent to admin when someone submits the contact form",
    subject: "New contact form submission from {{senderName}}",
    trigger: "on_contact_form",
    recipients: "admin",
    body: `<h2>New Contact Form Submission</h2>
<p><strong>From:</strong> {{senderName}} ({{senderEmail}})</p>
<p><strong>Subject:</strong> {{messageSubject}}</p>
<p><strong>Message:</strong></p>
<blockquote style="border-left:4px solid #2563eb;padding:8px 16px;margin:16px 0;background:#f8fafc;">
{{messageBody}}
</blockquote>
<p>Reply directly to <a href="mailto:{{senderEmail}}">{{senderEmail}}</a></p>`,
  },
  {
    name: "Contact Form - Confirmation",
    description: "Auto-reply sent to user who submitted the contact form",
    subject: "We received your message — Party Boats USA",
    trigger: "on_contact_form",
    recipients: "sender",
    body: `<h2>Thanks for reaching out!</h2>
<p>Hi {{senderName}},</p>
<p>We've received your message and will get back to you as soon as possible — usually within 1 business day.</p>
<p>In the meantime, feel free to browse our <a href="{{siteUrl}}/search">boat listings</a> or check out our <a href="{{siteUrl}}/faq">FAQ page</a>.</p>
<p>— The Party Boats USA Team</p>`,
  },
  {
    name: "Admin - New Boat Submission",
    description: "Notifies admin when a new boat listing is submitted for review",
    subject: "[Admin] New boat submission: {{boatName}}",
    trigger: "on_boat_submission",
    recipients: "admin",
    body: `<h2>New Boat Submission</h2>
<p>A new boat listing has been submitted and needs review:</p>
<ul>
  <li><strong>Boat:</strong> {{boatName}}</li>
  <li><strong>Operator:</strong> {{operatorName}}</li>
  <li><strong>Location:</strong> {{cityName}}, {{stateCode}}</li>
</ul>
<p><a href="{{siteUrl}}/admin/submissions" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Review Submission</a></p>`,
  },
  {
    name: "Admin - New Claim Request",
    description: "Notifies admin when an operator submits a claim request",
    subject: "[Admin] New claim request: {{boatName}}",
    trigger: "on_claim_submitted",
    recipients: "admin",
    body: `<h2>New Claim Request</h2>
<p>An operator has requested to claim a boat listing:</p>
<ul>
  <li><strong>Boat:</strong> {{boatName}}</li>
  <li><strong>Operator:</strong> {{operatorName}} ({{operatorEmail}})</li>
  <li><strong>Message:</strong> {{claimMessage}}</li>
</ul>
<p><a href="{{siteUrl}}/admin/boats" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Review Claims</a></p>`,
  },
  {
    name: "Admin - New Operator Registration",
    description: "Notifies admin when a new operator registers",
    subject: "[Admin] New operator registration: {{operatorName}}",
    trigger: "on_operator_registration",
    recipients: "admin",
    body: `<h2>New Operator Registration</h2>
<p>A new operator has registered on Party Boats USA:</p>
<ul>
  <li><strong>Name:</strong> {{operatorName}}</li>
  <li><strong>Email:</strong> {{operatorEmail}}</li>
  <li><strong>Business:</strong> {{businessName}}</li>
</ul>
<p><a href="{{siteUrl}}/admin/users" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">View Operators</a></p>`,
  },
  {
    name: "Brag Board - Photo Approved",
    description: "Sent to submitter when their brag board photo is approved",
    subject: "Your catch photo is live on Party Boats USA!",
    trigger: "on_brag_photo_approved",
    recipients: "submitter",
    body: `<h2>Your Catch is Featured!</h2>
<p>Hi {{submitterName}},</p>
<p>Your catch photo has been approved and is now displayed on our <a href="{{siteUrl}}/brag-board">Brag Board</a>!</p>
<p>Thanks for sharing your experience. Tight lines!</p>
<p>— The Party Boats USA Team</p>`,
  },
  {
    name: "Membership Upgrade - Confirmation",
    description: "Sent to operator when they upgrade their membership tier",
    subject: "Welcome to {{tierName}} — Party Boats USA",
    trigger: "on_tier_upgrade",
    recipients: "operator",
    body: `<h2>Upgrade Complete!</h2>
<p>Hi {{operatorName}},</p>
<p>You've been upgraded to the <strong>{{tierName}}</strong> tier. Here's what's now included:</p>
<ul>
  <li>{{tierBenefits}}</li>
</ul>
<p>Your enhanced listing is already live. Check it out in your <a href="{{siteUrl}}/operator/dashboard">Captain Portal</a>.</p>
<p>— The Party Boats USA Team</p>`,
  },
];

async function main() {
  console.log("=== Seeding Email Templates ===\n");

  try {
    const { rows } = await query("SELECT NOW() as now");
    console.log(`Connected at ${rows[0].now}\n`);

    let inserted = 0;
    let skipped = 0;

    for (const t of templates) {
      const { rows: existing } = await query(
        "SELECT id FROM email_templates WHERE name = $1",
        [t.name]
      );

      if (existing.length > 0) {
        console.log(`  ⏭ "${t.name}" — already exists`);
        skipped++;
        continue;
      }

      await query(
        `INSERT INTO email_templates (name, description, subject, body, trigger, recipients, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [t.name, t.description, t.subject, t.body, t.trigger, t.recipients, true]
      );
      console.log(`  ✓ "${t.name}"`);
      inserted++;
    }

    console.log(`\n=== Done: ${inserted} inserted, ${skipped} skipped ===`);
  } catch (err) {
    console.error("\n✗ Failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
