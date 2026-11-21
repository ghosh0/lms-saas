import { NextRequest, NextResponse } from "next/server";
import { startSessionAction } from "@/actions/lessons";
import { z } from "zod";

const RequestSchema = z.object({
  lessonId: z.string().min(1),
  userId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, userId } = RequestSchema.parse(body);

    const result = await startSessionAction(lessonId, userId);

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || "Failed to start session" }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[api/session] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

