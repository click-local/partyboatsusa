import { Resend } from "resend";
import { db } from "@/lib/db";
import { boats, operators } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "support@partyboatsusa.com";
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PartyBoatsUSA <noreply@notifications.partyboatsusa.com>";

interface NotificationRecipient {
  operatorEmail: string | null;
  boatEmail: string | null;
  isClaimed: boolean;
}

export async function getBoatNotificationRecipient(
  boatId: number
): Promise<NotificationRecipient> {
  const [boat] = await db
    .select({
      operatorId: boats.operatorId,
      email: boats.email,
    })
    .from(boats)
    .where(eq(boats.id, boatId));

  if (!boat) return { operatorEmail: null, boatEmail: null, isClaimed: false };

  let operatorEmail: string | null = null;
  if (boat.operatorId) {
    const [op] = await db
      .select({ email: operators.email })
      .from(operators)
      .where(eq(operators.id, boat.operatorId));
    operatorEmail = op?.email || null;
  }

  return {
    operatorEmail,
    boatEmail: boat.email || null,
    isClaimed: !!boat.operatorId,
  };
}

export async function sendBoatNotification(options: {
  boatId: number;
  subject: string;
  html: string;
}): Promise<void> {
  try {
    const recipient = await getBoatNotificationRecipient(options.boatId);

    const to: string[] = [ADMIN_EMAIL];

    if (recipient.isClaimed && recipient.operatorEmail) {
      to.push(recipient.operatorEmail);
    } else if (recipient.boatEmail) {
      to.push(recipient.boatEmail);
    }

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error("Failed to send boat notification email:", error);
  }
}
