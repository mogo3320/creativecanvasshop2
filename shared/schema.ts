import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Sessions table
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
});

// Images table
export const images = sqliteTable("images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: text("created_at").notNull(),
});
