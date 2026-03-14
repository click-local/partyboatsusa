const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function starRating(rating: number): string {
  const filled = "★";
  const empty = "☆";
  return filled.repeat(rating) + empty.repeat(5 - rating);
}

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr>
<td style="background-color:#004685;padding:24px 32px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:0.5px;">Party Boats USA</h1>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:32px;">
${content}
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:16px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
  <p style="margin:0;font-size:12px;color:#6b7280;">
    <a href="${SITE_URL}" style="color:#004685;text-decoration:none;">partyboatsusa.com</a>
  </p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
<tr><td align="center">
  <a href="${href}" style="display:inline-block;background-color:#004685;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:6px;">${text}</a>
</td></tr>
</table>`;
}

function claimOrManageCta(isClaimed: boolean, boatId?: number): string {
  if (isClaimed) {
    return ctaButton("Manage Your Listing", `${SITE_URL}/operator/dashboard`);
  }

  const claimUrl = boatId
    ? `${SITE_URL}/operator/claim?boatId=${boatId}`
    : `${SITE_URL}/operator/login`;

  return `
<div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin-top:24px;text-align:center;">
  <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#1e40af;">Is this your boat?</p>
  <p style="margin:0 0 16px;font-size:13px;color:#3b82f6;">Claim your free listing to manage your profile, respond to reviews, and connect with more anglers.</p>
  ${ctaButton("Claim Your Free Listing", claimUrl)}
</div>`;
}

// ---- Review Notification ----

interface ReviewNotificationData {
  boatName: string;
  boatSlug: string;
  boatId: number;
  reviewerName: string;
  rating: number;
  title: string;
  comment: string;
  isClaimed: boolean;
}

export function buildReviewNotificationEmail(
  data: ReviewNotificationData
): string {
  const commentSnippet =
    data.comment.length > 200
      ? data.comment.slice(0, 200) + "..."
      : data.comment;

  const content = `
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">New Review for ${escapeHtml(data.boatName)}</h2>
<p style="margin:0 0 20px;font-size:13px;color:#6b7280;">A customer has left a review on Party Boats USA.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:0;">
<tr><td style="padding:20px;">
  <p style="margin:0 0 8px;font-size:24px;color:#f59e0b;letter-spacing:2px;">${starRating(data.rating)}</p>
  <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(data.title)}</p>
  <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">by ${escapeHtml(data.reviewerName)}</p>
  <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${escapeHtml(commentSnippet)}</p>
</td></tr>
</table>

<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center;">This review is pending approval and is not yet visible on the site.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
<tr><td align="center">
  <a href="${SITE_URL}/boats/${data.boatSlug}" style="font-size:13px;color:#004685;text-decoration:underline;">View Listing</a>
</td></tr>
</table>

${claimOrManageCta(data.isClaimed, data.boatId)}`;

  return emailWrapper(content);
}

// ---- Brag Board Notification ----

interface BragBoardNotificationData {
  boatName: string;
  boatSlug: string;
  boatId: number;
  submitterName: string;
  catchDescription: string;
  isClaimed: boolean;
}

export function buildBragBoardNotificationEmail(
  data: BragBoardNotificationData
): string {
  const descSnippet =
    data.catchDescription.length > 200
      ? data.catchDescription.slice(0, 200) + "..."
      : data.catchDescription;

  const content = `
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">New Catch Photo for ${escapeHtml(data.boatName)}</h2>
<p style="margin:0 0 20px;font-size:13px;color:#6b7280;">An angler has submitted a catch photo on Party Boats USA.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:0;">
<tr><td style="padding:20px;">
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Submitted by <strong style="color:#111827;">${escapeHtml(data.submitterName)}</strong></p>
  <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${escapeHtml(descSnippet)}</p>
</td></tr>
</table>

<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center;">This photo is pending approval and is not yet visible on the site.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
<tr><td align="center">
  <a href="${SITE_URL}/boats/${data.boatSlug}" style="font-size:13px;color:#004685;text-decoration:underline;">View Listing</a>
</td></tr>
</table>

${claimOrManageCta(data.isClaimed, data.boatId)}`;

  return emailWrapper(content);
}

// ---- Boat Submission Notification (Admin) ----

interface BoatSubmissionNotificationData {
  boatName: string;
  operatorName: string;
  operatorEmail: string;
  cityName: string;
  stateCode: string;
  capacity: number;
  phone: string;
  websiteUrl: string;
}

export function buildBoatSubmissionNotificationEmail(
  data: BoatSubmissionNotificationData
): string {
  const content = `
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">New Boat Submission</h2>
<p style="margin:0 0 20px;font-size:13px;color:#6b7280;">An operator has submitted a new boat listing for review on Party Boats USA.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:0;">
<tr><td style="padding:20px;">
  <p style="margin:0 0 8px;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(data.boatName)}</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Operator: <strong style="color:#111827;">${escapeHtml(data.operatorName)}</strong></p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Email: ${escapeHtml(data.operatorEmail)}</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Location: ${escapeHtml(data.cityName)}, ${escapeHtml(data.stateCode)}</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Capacity: ${data.capacity} passengers</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Phone: ${escapeHtml(data.phone)}</p>
  <p style="margin:0;font-size:13px;color:#6b7280;">Website: <a href="${escapeHtml(data.websiteUrl)}" style="color:#004685;">${escapeHtml(data.websiteUrl)}</a></p>
</td></tr>
</table>

<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center;">This listing is pending admin review.</p>`;

  return emailWrapper(content);
}

// ---- Claim Request Notification (Admin) ----

interface ClaimRequestNotificationData {
  boatName: string;
  boatCity: string;
  boatState: string;
  operatorName: string;
  operatorEmail: string;
  message?: string | null;
}

export function buildClaimRequestNotificationEmail(
  data: ClaimRequestNotificationData
): string {
  const content = `
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">New Claim Request</h2>
<p style="margin:0 0 20px;font-size:13px;color:#6b7280;">An operator has requested to claim a boat listing on Party Boats USA.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:0;">
<tr><td style="padding:20px;">
  <p style="margin:0 0 8px;font-size:15px;font-weight:bold;color:#111827;">${escapeHtml(data.boatName)}</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Location: ${escapeHtml(data.boatCity)}, ${escapeHtml(data.boatState)}</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Claimed by: <strong style="color:#111827;">${escapeHtml(data.operatorName)}</strong></p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Email: ${escapeHtml(data.operatorEmail)}</p>${data.message ? `\n  <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Message: <em>${escapeHtml(data.message)}</em></p>` : ""}
</td></tr>
</table>

<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center;">Please review this claim in the admin panel.</p>`;

  return emailWrapper(content);
}

// ---- Claim Approved/Rejected Notification (to Operator) ----

interface ClaimResultNotificationData {
  boatName: string;
  boatSlug: string;
  approved: boolean;
}

export function buildClaimResultEmail(data: ClaimResultNotificationData): string {
  const content = data.approved
    ? `
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Claim Approved!</h2>
<p style="margin:0 0 20px;font-size:14px;color:#374151;">Great news - your claim for <strong>${escapeHtml(data.boatName)}</strong> has been approved. You can now manage your listing from your Captain's Portal.</p>

${ctaButton("Manage Your Listing", `${SITE_URL}/operator/dashboard`)}

<p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Update your photos, respond to reviews, and make sure your information is accurate to attract more customers.</p>`
    : `
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Claim Request Update</h2>
<p style="margin:0 0 20px;font-size:14px;color:#374151;">Unfortunately, your claim for <strong>${escapeHtml(data.boatName)}</strong> could not be approved at this time.</p>

<p style="margin:0 0 20px;font-size:13px;color:#6b7280;">If you believe this was an error, please contact us at <a href="mailto:support@partyboatsusa.com" style="color:#004685;">support@partyboatsusa.com</a> and we'll be happy to help.</p>`;

  return emailWrapper(content);
}

// ---- Brag Board Photo Approved (to Submitter) ----

interface PhotoApprovedNotificationData {
  boatName: string;
  boatSlug: string;
  submitterName: string;
}

export function buildPhotoApprovedEmail(data: PhotoApprovedNotificationData): string {
  const content = `
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Your Photo Has Been Approved!</h2>
<p style="margin:0 0 20px;font-size:14px;color:#374151;">Hey ${escapeHtml(data.submitterName)}, your catch photo for <strong>${escapeHtml(data.boatName)}</strong> is now live on the Brag Board!</p>

${ctaButton("View on Brag Board", `${SITE_URL}/brag-board`)}

<p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Thanks for sharing your catch with the Party Boats USA community.</p>`;

  return emailWrapper(content);
}

// ---- Operator Reply to Review (to Reviewer) ----

interface OperatorReplyNotificationData {
  boatName: string;
  boatSlug: string;
  reviewerName: string;
  reviewTitle: string;
  replySnippet: string;
}

export function buildOperatorReplyEmail(data: OperatorReplyNotificationData): string {
  const snippet =
    data.replySnippet.length > 300
      ? data.replySnippet.slice(0, 300) + "..."
      : data.replySnippet;

  const content = `
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">The Captain Responded to Your Review</h2>
<p style="margin:0 0 20px;font-size:14px;color:#374151;">Hi ${escapeHtml(data.reviewerName)}, the operator of <strong>${escapeHtml(data.boatName)}</strong> has replied to your review.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:0;">
<tr><td style="padding:20px;">
  <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Your review: <strong style="color:#111827;">${escapeHtml(data.reviewTitle)}</strong></p>
  <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;font-style:italic;">"${escapeHtml(snippet)}"</p>
</td></tr>
</table>

${ctaButton("View Full Reply", `${SITE_URL}/boats/${data.boatSlug}`)}`;

  return emailWrapper(content);
}

// ---- Contact Form Submission (to Admin) ----

interface ContactFormNotificationData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function buildContactFormEmail(data: ContactFormNotificationData): string {
  const escapedMessage = escapeHtml(data.message).replace(/\n/g, "<br>");

  const content = `
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">New Contact Form Submission</h2>
<p style="margin:0 0 20px;font-size:13px;color:#6b7280;">Someone has reached out via the contact form on Party Boats USA.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:0;">
<tr><td style="padding:20px;">
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">From: <strong style="color:#111827;">${escapeHtml(data.name)}</strong></p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Email: <a href="mailto:${escapeHtml(data.email)}" style="color:#004685;">${escapeHtml(data.email)}</a></p>
  <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">Subject: <strong style="color:#111827;">${escapeHtml(data.subject)}</strong></p>
  <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${escapedMessage}</p>
</td></tr>
</table>

<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center;">You can reply directly to this person at ${escapeHtml(data.email)}.</p>`;

  return emailWrapper(content);
}
