import "dotenv/config";
import path from "path";
import fs from "fs";
import http from "http";
import https from "https";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = Number(process.env.PORT || 3000);

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

const keyPath = process.env.SSL_KEY_PATH;
const certPath = process.env.SSL_CERT_PATH;

if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  try {
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);
    const server = https.createServer({ key, cert }, app);
    server.listen(port, () => {
      console.log(`🔐 HTTPS server running on port ${port}`);
      console.log(`📱 Frontend: https://localhost:${port}`);
      console.log(`🔧 API: https://localhost:${port}/api`);
    });
  } catch (e) {
    console.warn("HTTPS failed, falling back to HTTP:", (e as any)?.message || e);
    app.listen(port, () => {
      console.log(`🚀 HTTP server running on port ${port}`);
      console.log(`📱 Frontend: http://localhost:${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
    });
  }
} else {
  app.listen(port, () => {
    console.log(`🚀 HTTP server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
  });
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
