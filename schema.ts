import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Stores each generated image
export const images = sqliteTable("images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prompt: text("prompt").notNull(),
  imageBase64: text("image_base64").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Stores user sessions (optional but included for future expansion)
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
