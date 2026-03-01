import { db } from "./index";
import { images, sessions } from "../shared/schema";
import { eq } from "drizzle-orm";

// Save a generated image record
export async function saveImage({
  sessionId,
  prompt,
  imageUrl,
}: {
  sessionId: string;
  prompt: string;
  imageUrl: string;
}) {
  await db.insert(images).values({
    sessionId,
    prompt,
    imageUrl,
    createdAt: new Date().toISOString(),
  });
}

// Create or update a session record
export async function saveSession(sessionId: string) {
  const existing = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (existing.length === 0) {
    await db.insert(sessions).values({
      id: sessionId,
      createdAt: new Date().toISOString(),
    });
  }
}

// Get all images for a session
export async function getImagesForSession(sessionId: string) {
  return db
    .select()
    .from(images)
    .where(eq(images.sessionId, sessionId))
    .orderBy(images.createdAt);
}
