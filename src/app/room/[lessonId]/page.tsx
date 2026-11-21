// =============================================================================
// Dynamic Route: /room/[lessonId] — Strictly Protected Voice Room
// =============================================================================

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import VoiceRoomPage from "@/components/VoiceRoom";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function RoomPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { lessonId } = await params;

  if (!session || !session.user) {
    redirect(`/login?callbackUrl=/room/${lessonId}`);
  }

  return <VoiceRoomPage lessonId={lessonId} />;
}
