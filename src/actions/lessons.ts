"use server";

// =============================================================================
// Server Actions — Lessons, Marketplace, Creation & Session Management
// =============================================================================

import { prisma } from "@/lib/prisma";
import { generateUserId } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface SessionInitData {
  sessionId: string;
  roomName: string;
  userId: string;
  lesson: {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    durationMins: number;
    systemPrompt: string;
    pdfUrl?: string | null;
    pdfName?: string | null;
  };
}

export interface CreateCourseInput {
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  systemPrompt: string;
  durationMins?: number;
  priceInRupees: number; // 0 for free, or any custom price in INR
  pdfUrl?: string;
  pdfName?: string;
}

/**
 * Server Action: Get the current user profile (including credit balance)
 */
export async function getCurrentUserAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, data: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        role: true,
        createdAt: true,
      },
    });

    return { success: true, data: user };
  } catch (err) {
    console.error("[getCurrentUserAction] Error:", err);
    return { success: false, data: null };
  }
}

/**
 * Server Action: Create a new live course
 * Requirement: 1 live course = 5 credits.
 * Any user can be a creator. Creator sets the marketplace sale price.
 */
export async function createCourseAction(input: CreateCourseInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Please log in to create a course." };
    }

    // Verify user has sufficient credits (5 credits required for regular users; free for admins)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, credits: true, role: true },
    });

    const isAdmin = user?.role === "admin";

    if (!isAdmin && (!user || user.credits < 5)) {
      return {
        success: false,
        error: `Insufficient credits. Creating a live course requires 5 credits (Current balance: ${user?.credits ?? 0} credits).`,
        insufficientCredits: true,
      };
    }

    // Validate inputs
    if (!input.title || input.title.trim().length < 3) {
      return { success: false, error: "Course title must be at least 3 characters." };
    }

    if (!input.systemPrompt || input.systemPrompt.trim().length < 10) {
      return { success: false, error: "AI Teacher instructions must be at least 10 characters." };
    }

    const price = Math.max(0, Math.floor(input.priceInRupees || 0));

    // Atomically create the course (deduct 5 credits only if regular user)
    const newCourse = await prisma.$transaction(async (tx) => {
      if (!isAdmin) {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            credits: { decrement: 5 },
          },
        });
      }

      return await tx.lesson.create({
        data: {
          title: input.title.trim(),
          description: input.description.trim(),
          subject: input.subject.trim(),
          gradeLevel: input.gradeLevel.trim(),
          systemPrompt: input.systemPrompt.trim(),
          durationMins: input.durationMins || 30,
          priceInRupees: price,
          creatorId: session.user.id,
          pdfUrl: input.pdfUrl || null,
          pdfName: input.pdfName || null,
          isPublished: true,
        },
      });
    });

    return {
      success: true,
      data: newCourse,
      message: isAdmin ? "Course created successfully with Admin access." : "Course created successfully! 5 credits deducted.",
    };
  } catch (error) {
    console.error("[createCourseAction] Error:", error);
    return { success: false, error: "Failed to create course. Please try again." };
  }
}

/**
 * Server Action: Get all published lessons from Neon DB with purchase/access status
 */
export async function getLessonsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const currentUserId = session?.user?.id;

    const lessons = await prisma.lesson.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        gradeLevel: true,
        durationMins: true,
        priceInRupees: true,
        creatorId: true,
        pdfUrl: true,
        pdfName: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        purchases: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    // Check if the current requesting user is admin
    let isCurrentUserAdmin = false;
    if (currentUserId) {
      const userRecord = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true },
      });
      isCurrentUserAdmin = userRecord?.role === "admin";
    }

    const formatted = lessons.map((l) => {
      const isCreator = currentUserId ? l.creatorId === currentUserId : false;
      const isPurchased = currentUserId && Array.isArray(l.purchases) && l.purchases.length > 0;
      const isFree = l.priceInRupees === 0;
      const hasAccess = isCurrentUserAdmin || isCreator || isPurchased || isFree;

      return {
        ...l,
        isCreator,
        isPurchased: Boolean(isPurchased),
        hasAccess,
      };
    });

    return { success: true, data: formatted, currentUserId };
  } catch (error) {
    console.error("[getLessonsAction] Error:", error);
    return { success: false, error: "Failed to fetch lessons" };
  }
}

/**
 * Server Action: Get a single lesson with details
 */
export async function getLessonAction(lessonId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const currentUserId = session?.user?.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, isPublished: true },
      include: {
        creator: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    if (!lesson) {
      return { success: false, error: "Lesson not found" };
    }

    let hasAccess = lesson.priceInRupees === 0;
    if (currentUserId) {
      const userRecord = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true },
      });
      if (userRecord?.role === "admin") {
        hasAccess = true;
      } else if (lesson.creatorId === currentUserId) {
        hasAccess = true;
      } else {
        const purchase = await prisma.purchase.findUnique({
          where: {
            userId_lessonId: {
              userId: currentUserId,
              lessonId: lesson.id,
            },
          },
        });
        if (purchase) hasAccess = true;
      }
    }

    return { success: true, data: { ...lesson, hasAccess } };
  } catch (error) {
    console.error("[getLessonAction] Error:", error);
    return { success: false, error: "Failed to fetch lesson" };
  }
}

/**
 * Server Action: Start a new learning session in Neon DB
 */
export async function startSessionAction(
  lessonId: string,
  providedUserId?: string
): Promise<{ success: boolean; data?: SessionInitData; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const currentUserId = session?.user?.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, isPublished: true },
    });

    if (!lesson) {
      return { success: false, error: "Lesson not found or unavailable" };
    }

    // Verify access rights (creator, purchased, admin, or free)
    let hasAccess = lesson.priceInRupees === 0;
    if (currentUserId) {
      const userRecord = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true },
      });

      if (userRecord?.role === "admin") {
        hasAccess = true;
      } else if (lesson.creatorId === currentUserId) {
        hasAccess = true;
      } else {
        const purchase = await prisma.purchase.findUnique({
          where: {
            userId_lessonId: {
              userId: currentUserId,
              lessonId: lesson.id,
            },
          },
        });
        if (purchase) hasAccess = true;
      }
    }

    if (!hasAccess) {
      return {
        success: false,
        error: `Access restricted. Please purchase this course for ₹${lesson.priceInRupees} to enter the voice room.`,
      };
    }

    const userId = currentUserId || providedUserId || generateUserId();
    const roomName = `room-${lessonId.slice(0, 8)}-${Date.now()}`;

    // Create session record in Neon PostgreSQL
    const liveSession = await prisma.learningSession.create({
      data: {
        lessonId: lesson.id,
        roomName,
        userId,
        startedAt: new Date(),
      },
    });

    return {
      success: true,
      data: {
        sessionId: liveSession.id,
        roomName,
        userId,
        lesson: {
          id: lesson.id,
          title: lesson.title,
          subject: lesson.subject,
          gradeLevel: lesson.gradeLevel,
          durationMins: lesson.durationMins,
          systemPrompt: lesson.systemPrompt,
          pdfUrl: lesson.pdfUrl,
          pdfName: lesson.pdfName,
        },
      },
    };
  } catch (error) {
    console.error("[startSessionAction] Error:", error);
    return { success: false, error: "Failed to initialize lesson session" };
  }
}

/**
 * Server Action: End an ongoing session
 */
export async function endSessionAction(sessionId: string) {
  try {
    await prisma.learningSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });
    return { success: true };
  } catch (error) {
    console.error("[endSessionAction] Error:", error);
    return { success: false, error: "Failed to mark session as ended" };
  }
}
