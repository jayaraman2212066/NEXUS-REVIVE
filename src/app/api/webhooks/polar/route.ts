import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function verifySignature(body: string, signature: string, secret: string): boolean {
  try {
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("webhook-signature") || "";
  const secret = process.env.POLAR_WEBHOOK_SECRET || "";

  if (secret && signature && !verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data } = event;

  // ── Subscription events ─────────────────────────────────────────────────────
  const email: string | undefined =
    ((data?.user as Record<string, unknown>)?.email as string | undefined) ??
    ((data?.customer as Record<string, unknown>)?.email as string | undefined);

  if (email) {
    if (type === "subscription.created" || type === "subscription.updated") {
      const isActive = (data?.status as string) === "active";
      await prisma.user.updateMany({
        where: { email },
        data: {
          isPro: isActive,
          polarSubId: (data?.id as string) || "",
          polarSubStatus: (data?.status as string) || "",
        },
      });
    }

    if (type === "subscription.canceled" || type === "subscription.revoked") {
      await prisma.user.updateMany({
        where: { email },
        data: { isPro: false, polarSubStatus: "canceled" },
      });
    }
  }

  // ── License key events ───────────────────────────────────────────────────────
  if (type === "license_key.created" || type === "benefit.granted") {
    const keyValue = (data?.key as string) || (data?.license_key as string);
    const customerEmail = email ||
      ((data?.customer as Record<string, unknown>)?.email as string);
    const orderId = (data?.order_id as string) || (data?.id as string) || "";
    const expiresAt = data?.expires_at ? new Date(data.expires_at as string) : null;

    if (keyValue) {
      // Store the license key in DB so it's ready when the user activates
      await prisma.licenseKey.upsert({
        where: { key: keyValue.toUpperCase() },
        update: {
          email: customerEmail || "",
          polarOrderId: orderId,
          isActive: true,
          ...(expiresAt ? { expiresAt } : {}),
        },
        create: {
          key: keyValue.toUpperCase(),
          email: customerEmail || "",
          polarOrderId: orderId,
          isActive: true,
          ...(expiresAt ? { expiresAt } : {}),
        },
      });

      // If customer already has an account, upgrade them immediately
      if (customerEmail) {
        await prisma.user.updateMany({
          where: { email: customerEmail },
          data: { isPro: true, polarSubStatus: "license_key" },
        });
      }
    }
  }

  // ── License key revoked ─────────────────────────────────────────────────────
  if (type === "license_key.updated" || type === "benefit.revoked") {
    const keyValue = (data?.key as string) || (data?.license_key as string);
    if (keyValue) {
      const licKey = await prisma.licenseKey.findUnique({
        where: { key: keyValue.toUpperCase() },
      });
      if (licKey) {
        await prisma.licenseKey.update({
          where: { key: keyValue.toUpperCase() },
          data: { isActive: false },
        });
        // Revoke pro if no other active keys
        if (licKey.userId) {
          const otherActiveKeys = await prisma.licenseKey.count({
            where: { userId: licKey.userId, isActive: true },
          });
          if (otherActiveKeys === 0) {
            await prisma.user.update({
              where: { id: licKey.userId },
              data: { isPro: false, polarSubStatus: "revoked" },
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
