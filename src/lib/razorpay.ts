// =============================================================================
// Razorpay Server Instance & Credit Tier Definitions
// =============================================================================

import Razorpay from "razorpay";
import crypto from "crypto";

export interface CreditTier {
  id: "TIER_5" | "TIER_55" | "TIER_120";
  credits: number;
  bonusCredits: number;
  amountInRupees: number;
  name: string;
  badge?: string;
  popular?: boolean;
}

export const CREDIT_TIERS: Record<string, CreditTier> = {
  TIER_5: {
    id: "TIER_5",
    credits: 5,
    bonusCredits: 0,
    amountInRupees: 50,
    name: "Starter Pack",
    badge: "1 Course",
  },
  TIER_55: {
    id: "TIER_55",
    credits: 55,
    bonusCredits: 5,
    amountInRupees: 500,
    name: "Growth Bundle",
    badge: "+5 Bonus Credits",
    popular: true,
  },
  TIER_120: {
    id: "TIER_120",
    credits: 120,
    bonusCredits: 10,
    amountInRupees: 1000,
    name: "Scale Studio",
    badge: "+10 Bonus Credits",
  },
};

export function getRazorpayClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials are not configured in environment variables.");
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Verify Razorpay HMAC SHA256 Signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) return false;

  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

