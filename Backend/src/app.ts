import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import { setupSwagger } from './config/swagger.js';
import { authRouter } from "./routes/auth.route.js";
import { orderRouter } from "./routes/order.route.js";
import { adminRouter } from "./routes/admin.routes.js";
import { projectRouter } from "./routes/project.route.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { healthCheck } from "./controller/health.controller.js";
import { performanceMonitor } from './middleware/performance.middleware.js';
import {
  apiLimiter,
  aiLimiter,
  authLimiter,
  redisRateLimiter,
} from "./middleware/rateLimiter.js";
import Express, {
  type Application,
  type Request,
  type Response,
  type Express as Ex,
} from "express";

const app: Application = Express();

// CORS Configuration
const corsOptions = {
  origin:
    config.NODE_ENV === "production"
      ? process.env.CLIENT_URL || "https://yourdomain.com"
      : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(Express.json({ limit: "10mb" }));
app.use(Express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});
app.use("/health", healthCheck);

// 1. Global & Specific Rate Limiters Applied First
app.use("/api", apiLimiter);

app.use('/api/v1/admin', redisRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many admin requests, please slow down.',
}));
app.use(performanceMonitor(1000));
app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/projects", aiLimiter);

// 2. Routers Mounted Second
app.use("/api/v1", authRouter);
app.use("/api/v1", projectRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", adminRouter);

// 404 Route Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

// Swagger Documentation setup 
setupSwagger(app as unknown as Ex);

export { app };
