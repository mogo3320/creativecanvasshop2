import express from "express";
import Groq from "groq-sdk";
import cors from "cors";

// Node 18+ has fetch built-in, so no import needed

console.log("PORT ENV:", process.env.PORT);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// REQUIRED for Render
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port", process.env.PORT || 3000);
});
