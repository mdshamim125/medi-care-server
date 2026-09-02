import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cron from "node-cron";

import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import { PaymentController } from "./app/modules/payment/payment.controller";
import { AppointmentService } from "./app/modules/appointment/appointment.service";

const app: Application = express();

// ============================================
// Global Middleware
// ============================================

app.use(cookieParser());

// ============================================
// Stripe Webhook
// IMPORTANT:
// This MUST come before express.json()
// because Stripe requires the raw request body
// for signature verification.
// ============================================

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent,
);

// ============================================
// CORS
// ============================================

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://medi-care-frontend-sigma.vercel.app",
    ],
    credentials: true,
  }),
);

// ============================================
// Body Parsers
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Unpaid Appointment Cleanup
// Runs every 5 minutes
// ============================================

cron.schedule("*/5 * * * *", async () => {
  try {
    console.log(
      "🔄 Running unpaid appointment cleanup at",
      new Date().toISOString(),
    );

    await AppointmentService.cancelUnpaidAppointments();

    console.log("✅ Unpaid appointment cleanup completed");
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});

// ============================================
// Health Check
// ============================================

app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Medi care server..",
  });
});

// ============================================
// API Routes
// ============================================

app.use("/api/v1", router);

// ============================================
// Global Error Handler
// ============================================

app.use(globalErrorHandler);

// ============================================
// 404 Handler
// ============================================

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
