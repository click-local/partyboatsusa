const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://partyboatsusa.com";

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
    ? `${SITE_URL}/operator/login?claimBoatId=${boatId}`
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
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">New Review for ${data.boatName}</h2>
<p style="margin:0 0 20px;font-size:13px;color:#6b7280;">A customer has left a review on Party Boats USA.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:0;">
<tr><td style="padding:20px;">
  <p style="margin:0 0 8px;font-size:24px;color:#f59e0b;letter-spacing:2px;">${starRating(data.rating)}</p>
  <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#111827;">${data.title}</p>
  <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">by ${data.reviewerName}</p>
  <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${commentSnippet}</p>
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
<h2 style="margin:0 0 8px;font-size:18px;color:#111827;">New Catch Photo for ${data.boatName}</h2>
<p style="margin:0 0 20px;font-size:13px;color:#6b7280;">An angler has submitted a catch photo on Party Boats USA.</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:0;">
<tr><td style="padding:20px;">
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Submitted by <strong style="color:#111827;">${data.submitterName}</strong></p>
  <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${descSnippet}</p>
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
  <p style="margin:0 0 8px;font-size:15px;font-weight:bold;color:#111827;">${data.boatName}</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Operator: <strong style="color:#111827;">${data.operatorName}</strong></p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Email: ${data.operatorEmail}</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Location: ${data.cityName}, ${data.stateCode}</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Capacity: ${data.capacity} passengers</p>
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Phone: ${data.phone}</p>
  <p style="margin:0;font-size:13px;color:#6b7280;">Website: <a href="${data.websiteUrl}" style="color:#004685;">${data.websiteUrl}</a></p>
</td></tr>
</table>

<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center;">This listing is pending admin review.</p>`;

  return emailWrapper(content);
}
