// =============================================================================
// API Route: GET /api/lessons
// Returns all published lessons for the dashboard.
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        gradeLevel: true,
        durationMins: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("[lessons] Error:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

