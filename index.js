import express from "express";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./shared/schema.js";

const app = express();
app.use(express.json());

// Initialize SQLite database
const sqlite = new Database("database.db");

// Initialize Drizzle ORM
export const db = drizzle(sqlite, { schema });

// Simple test route
app.get("/", (req, res) => {
  res.send("Backend is running and schema loaded successfully!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
