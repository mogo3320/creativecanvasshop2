import express from "express";
import Groq from "groq-sdk";
import cors from "cors";

// Node 18+ has fetch built-in, so no import needed

console.log("PORT ENV:", process.env.PORT);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
