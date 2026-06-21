import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Validate the license key against Polar's API
async function validateWithPolar(licenseKey: string): Promise<{
  valid: boolean;
  email?: string;
  orderId?: string;
  activationLimit?: number;
  activations?: number;
  expiresAt?: string;
}> {
  const productId = process.env.POLAR_PRODUCT_ID;
  if (!productId) return { valid: false };

  try {
    const res = await fetch("https://api.polar.sh/v1/license-keys/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        key: licenseKey,
        organization_id: process.env.POLAR_ORG_ID,
        activation_url: process.env.NEXT_PUBLIC_APP_URL || "https://nexusrevive.com",
      }),
    });

    if (!res.ok) return { valid: false };

    const data = await res.json();
    return {
      valid: data.valid === true,
      email: data.customer?.email,
      orderId: data.benefit_id || data.order_id || "",
      activationLimit: data.activation_limit,
      activations: data.activations,
      expiresAt: data.expires_at,
    };
  } catch {
    return { valid: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, email, password, name } = await req.json() as {
      licenseKey: string;
      email: string;
      password: string;
      name?: string;
    };

    if (!licenseKey?.trim()) {
      return NextResponse.json({ error: "License key is required" }, { status: 400 });
    }
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedKey = licenseKey.trim().toUpperCase();

    // Check if key already used by someone else
    const existingKey = await prisma.licenseKey.findUnique({ where: { key: normalizedKey } });
    if (existingKey?.userId) {
      // Allow same user to re-activate
      const ownerUser = await prisma.user.findUnique({ where: { id: existingKey.userId } });
      if (ownerUser && ownerUser.email !== email.toLowerCase().trim()) {
        return NextResponse.json({ error: "This license key is already activated on another account" }, { status: 409 });
      }
    }

    // Validate with Polar API
    const polar = await validateWithPolar(normalizedKey);
    if (!polar.valid) {
      // Fallback: if Polar API not configured, check DB only (dev mode)
      if (!process.env.POLAR_ACCESS_TOKEN && existingKey?.isActive) {
        // Dev mode: key exists in DB and is active — allow
      } else if (!existingKey?.isActive) {
        return NextResponse.json({ error: "Invalid or expired license key" }, { status: 400 });
      }
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // New user — register + activate
      const passwordHash = await bcrypt.hash(password, 12);
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name?.trim() || normalizedEmail.split("@")[0],
          passwordHash,
          isPro: true,
          polarSubStatus: "license_key",
        },
      });
    } else {
      // Existing user — verify password then upgrade
      if (user.passwordHash) {
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return NextResponse.json({ error: "Incorrect password for this account" }, { status: 401 });
        }
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isPro: true, polarSubStatus: "license_key" },
      });
    }

    // Save/update license key record
    await prisma.licenseKey.upsert({
      where: { key: normalizedKey },
      update: {
        userId: user.id,
        email: normalizedEmail,
        activatedAt: new Date(),
        isActive: true,
        ...(polar.expiresAt ? { expiresAt: new Date(polar.expiresAt) } : {}),
      },
      create: {
        key: normalizedKey,
        userId: user.id,
        email: normalizedEmail,
        polarOrderId: polar.orderId || "",
        activatedAt: new Date(),
        isActive: true,
        ...(polar.expiresAt ? { expiresAt: new Date(polar.expiresAt) } : {}),
      },
    });

    // Create session
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, isPro: true },
    });
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });
    return res;

  } catch (error) {
    console.error("License activation error:", error);
    return NextResponse.json({ error: "Activation failed. Please try again." }, { status: 500 });
  }
}
