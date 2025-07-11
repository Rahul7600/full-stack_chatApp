import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://devray.co.in", // ✅ Add production frontend domain
    ],
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Optional static file serving — only if frontend is actually built and copied into the backend image
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  const indexFile = path.join(distPath, "index.html");

  if (fs.existsSync(indexFile)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(indexFile);
    });
  } else {
    console.log("⚠️ Frontend build not found, skipping static file serving.");
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server is running on PORT: ${PORT}`);
  connectDB();
});
