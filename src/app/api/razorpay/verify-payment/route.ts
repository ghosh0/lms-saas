// =============================================================================
// API: Verify Razorpay Payment Signature & Credit User Account
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, lessonId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment proof parameters." }, { status: 400 });
    }

    // Verify cryptographic signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Payment verification failed. Invalid signature." }, { status: 400 });
    }

    // 1. Process Credits Fulfillment
    if (type === "CREDITS") {
      const transaction = await prisma.creditTransaction.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (!transaction) {
        return NextResponse.json({ error: "Transaction record not found." }, { status: 404 });
      }

      if (transaction.status === "COMPLETED") {
        return NextResponse.json({ success: true, message: "Transaction already processed." });
      }

      // Atomically credit the user's account and mark transaction completed
      const updatedUser = await prisma.$transaction(async (tx) => {
        await tx.creditTransaction.update({
          where: { id: transaction.id },
          data: {
            status: "COMPLETED",
            razorpayPaymentId: razorpay_payment_id,
          },
        });

        return await tx.user.update({
          where: { id: session.user.id },
          data: {
            credits: { increment: transaction.credits },
          },
          select: { id: true, credits: true },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully credited ${transaction.credits} credits to your account.`,
        newCredits: updatedUser.credits,
      });
    }

    // 2. Process Course Purchase Fulfillment
    if (type === "COURSE") {
      if (!lessonId) {
        return NextResponse.json({ error: "Missing lesson ID." }, { status: 400 });
      }

      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
      });

      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
      }

      await prisma.purchase.upsert({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: lesson.id,
          },
        },
        create: {
          userId: session.user.id,
          lessonId: lesson.id,
          amountPaidInRupees: lesson.priceInRupees,
          razorpayPaymentId: razorpay_payment_id,
        },
        update: {
          amountPaidInRupees: lesson.priceInRupees,
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully purchased access to ${lesson.title}.`,
      });
    }

    return NextResponse.json({ error: "Unrecognized payment type." }, { status: 400 });
  } catch (err: unknown) {
    console.error("[api/razorpay/verify-payment] Error:", err);
    const msg = err instanceof Error ? err.message : "Internal error verifying payment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

