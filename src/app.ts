
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.js";
import { apiRouter } from "./routes/api.js";

export const app = express();

app.disable("x-powered-by");

// CORS configuration
const allowedOrigins = config.FRONTEND_ORIGINS
  .filter((origin) => origin !== "*")
  .map((origin) => origin.trim().replace(/\/+$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Incoming Origin:", origin);
      console.log("Allowed Origins:", allowedOrigins);

      if (!origin) {
        return callback(null, true);
      }

      if (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.log("CORS REJECTED:", origin);

      return callback(null, false);
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "apikey",
      "x-client-info",
    ],
  }),
);

// Request body parser
app.use(express.json({ limit: "32kb" }));

// Root info & health check
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Backend Klinik UNESA",
    message: "Server backend berjalan.",
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api", apiRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);
