
import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import app, { connectDB } from "./backend/app";
import { initSocket } from "./backend/socket";

async function startServer() {
  const PORT = 3000;

  // API routes are already in 'app'
  // We just need to make sure 'app' is used correctly
  const server = express();
  const httpServer = createHttpServer(server);

  // Initialize Socket.io
  initSocket(httpServer);

  // Connect to Database
  await connectDB();

  // Use the backend app for API routes
  server.use(app);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    server.use(vite.middlewares);
  } else {
    // In production, serve static files
    server.use(express.static("dist"));
    server.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
