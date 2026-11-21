import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a unique room name for a lesson session */
export function generateRoomName(lessonId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `lesson-${lessonId}-${timestamp}-${random}`;
}

/** Generate an anonymous user ID (replace with real auth in production) */
export function generateUserId(): string {
  return `student-${Math.random().toString(36).substring(2, 10)}`;
}

