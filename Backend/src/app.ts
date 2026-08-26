
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import Express, {
  type Application,
  type Request,
  type Response,
  type Express as Ex,
} from "express";

import { config } from "./config/index.js";
import { setupSwagger } from "./config/swagger.js";

import { authRouter } from "./routes/auth.route.js";
import { orderRouter } from "./routes/order.route.js";
import { adminRouter } from "./routes/admin.routes.js";
import { projectRouter } from "./routes/project.route.js";
import { subscriptionRouter } from "./routes/subscription.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import { healthCheck } from "./controller/health.controller.js";
import { performanceMonitor } from "./middleware/performance.middleware.js";

import {
  apiLimiter,
  authLimiter,
  redisRateLimiter,
} from "./middleware/rateLimiter.js";

const app: Application = Express();

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
*/

const corsOptions = {
  origin:
    config.NODE_ENV === "production"
      ? process.env.CLIENT_URL || "https://yourdomain.com"
      : process.env.CLIENT_URL || "http://localhost:3000",

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(
  Express.json({
    limit: "10mb",
  }),
);

app.use(
  Express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get(
  "/health",
  (_req: Request, res: Response) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
    });
  },
);

app.use("/health", healthCheck);

/*
|--------------------------------------------------------------------------
| Rate Limiters
|--------------------------------------------------------------------------
*/

/**
 * General API rate limiter
 */
app.use(
  "/api",
  apiLimiter,
);

/**
 * Admin-specific rate limiter
 */
app.use(
  "/api/v1/admin",
  redisRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message:
      "Too many admin requests, please slow down.",
  }),
);

/**
 * Performance monitoring
 */
app.use(
  performanceMonitor(1000),
);

/**
 * Authentication rate limiter
 */
app.use(
  "/api/v1/auth",
  authLimiter,
);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

/**
 * Authentication
 *
 * /api/v1/auth/*
 */
app.use(
  "/api/v1",
  authRouter,
);

/**
 * Projects
 *
 * /api/v1/projects/*
 */
app.use(
  "/api/v1",
  projectRouter,
);

/**
 * Orders
 *
 * /api/v1/orders/*
 */
app.use(
  "/api/v1",
  orderRouter,
);

/**
 * Subscriptions
 *
 * /api/v1/subscriptions/*
 */
app.use(
  "/api/v1",
  subscriptionRouter,
);

/**
 * Admin
 *
 * IMPORTANT:
 *
 * adminRouter itself contains:
 *
 * /dashboard
 * /stats
 * /users
 * /orders
 * /projects
 * etc.
 *
 * Therefore it MUST be mounted at:
 *
 * /api/v1/admin
 *
 * Final URLs:
 *
 * /api/v1/admin/dashboard
 * /api/v1/admin/users
 * /api/v1/admin/orders
 * /api/v1/admin/projects
 * /api/v1/admin/subscriptions
 */
app.use(
  "/api/v1/admin",
  adminRouter,
);

/*
|--------------------------------------------------------------------------
| 404 Route Handler
|--------------------------------------------------------------------------
*/

app.use(
  (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  },
);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Swagger
|--------------------------------------------------------------------------
*/

setupSwagger(
  app as unknown as Ex,
);

export { app };