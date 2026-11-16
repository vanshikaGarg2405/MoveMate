
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import exchangeRoutes from "./routes/exchangeRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// ==========================================
// 1. SECURITY HEADERS
// ==========================================

app.use(helmet());

// ==========================================
// 2. CORS CONFIGURATION
// ==========================================

const allowedOrigin =
  process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==========================================
// 3. REQUEST BODY PARSING
// ==========================================

app.use(express.json({ limit: "10kb" }));

// ==========================================
// 4. GLOBAL RATE LIMITING
// ==========================================

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

// ==========================================
// 5. HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MoveMate API is running",
  });
});

// ==========================================
// 6. API ROUTES
// ==========================================

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/rides", rideRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/exchanges", exchangeRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// ==========================================
// 7. UNKNOWN ROUTE HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


// ==========================================
// 8. CENTRALIZED ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("Unhandled application error:", err);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Request failed";

  // Handle Multer file-upload errors
  if (err.name === "MulterError") {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        statusCode = 413;
        message = "File is too large. Maximum allowed size is 2MB.";
        break;

      case "LIMIT_FILE_COUNT":
      case "LIMIT_UNEXPECTED_FILE":
      case "LIMIT_FIELD_COUNT":
      case "LIMIT_PART_COUNT":
      case "LIMIT_FIELD_KEY":
      case "LIMIT_FIELD_VALUE":
        statusCode = 400;
        message = "Invalid file upload request.";
        break;

      default:
        statusCode = 400;
        message = "File upload failed.";
    }
  }

  // Handle other client-side errors
  if (statusCode < 400 || statusCode >= 600) {
    statusCode = 500;
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : message,
  });
});

export default app;