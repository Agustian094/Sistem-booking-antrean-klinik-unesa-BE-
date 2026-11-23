
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
      // Allow requests without origin (Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost during development
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      // Allow registered frontend domains
      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

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
