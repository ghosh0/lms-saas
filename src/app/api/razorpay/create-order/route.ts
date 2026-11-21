// =============================================================================
// API: Create Razorpay Order (Credits & Course Purchases)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRazorpayClient, CREDIT_TIERS } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required to initiate checkout." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, tierId, lessonId } = body;

    const razorpay = getRazorpayClient();

    // Check user role
    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    const isAdmin = userRecord?.role === "admin";

    // 1. Credit Tier Purchase
    if (type === "CREDITS") {
      if (isAdmin) {
        return NextResponse.json({ error: "Admins have unlimited credits and cannot purchase credits." }, { status: 400 });
      }

      const tier = CREDIT_TIERS[tierId];
      if (!tier) {
        return NextResponse.json({ error: "Invalid credit tier selected." }, { status: 400 });
      }

      // Amount in paise (1 INR = 100 paise)
      const amountInPaise = tier.amountInRupees * 100;

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_cred_${session.user.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          userId: session.user.id,
          type: "CREDITS",
          tierId: tier.id,
          credits: tier.credits.toString(),
        },
      });

      // Save pending transaction record
      await prisma.creditTransaction.create({
        data: {
          userId: session.user.id,
          tier: tier.id,
          credits: tier.credits,
          amountInRupees: tier.amountInRupees,
          razorpayOrderId: order.id,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        user: {
          name: session.user.name,
          email: session.user.email,
        },
      });
    }

    // 2. Course Purchase (Marketplace)
    if (type === "COURSE") {
      if (!lessonId) {
        return NextResponse.json({ error: "Lesson ID is required." }, { status: 400 });
      }

      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
      });

      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
      }

      // Check if already purchased
      const existingPurchase = await prisma.purchase.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: lesson.id,
          },
        },
      });

      if (existingPurchase || lesson.creatorId === session.user.id) {
        return NextResponse.json({ error: "You already own access to this course." }, { status: 400 });
      }

      if (isAdmin || lesson.priceInRupees <= 0) {
        // Free course or free for admin enrollment
        await prisma.purchase.upsert({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId: lesson.id,
            },
          },
          update: {},
          create: {
            userId: session.user.id,
            lessonId: lesson.id,
            amountPaidInRupees: 0,
          },
        });
        return NextResponse.json({ free: true, message: "Enrolled successfully (Free access)." });
      }

      const amountInPaise = lesson.priceInRupees * 100;

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_crs_${session.user.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          userId: session.user.id,
          type: "COURSE",
          lessonId: lesson.id,
        },
      });

      return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        user: {
          name: session.user.name,
          email: session.user.email,
        },
      });
    }

    return NextResponse.json({ error: "Invalid order type." }, { status: 400 });
  } catch (err: unknown) {
    console.error("[api/razorpay/create-order] Error:", err);
    const msg = err instanceof Error ? err.message : "Internal error creating payment order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

