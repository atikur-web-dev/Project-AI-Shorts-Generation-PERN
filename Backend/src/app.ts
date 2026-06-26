import Express, { type Application, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { logger } from "./config/logger.js";
import { config } from "./config/index.js";
import { authRouter } from './routes/auth.route.js';
import { projectRouter } from './routes/project.route.js';
import { apiLimiter, aiLimiter } from "./config/rate-limit.js";
import { errorHandler } from './middleware/error.middleware.js';
import { orderRouter } from "./routes/order.route.js";


const app: Application = Express();

// Middlewares
app.use(helmet());
app.use(cors({
    origin: config.NODE_ENV === "development" ? "*" : process.env.CLIENT_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(Express.json({limit: "10mb"}));
app.use(Express.urlencoded({extended:true , limit: "10mb"}));
app.use(morgan("dev"));

// Health Check Route
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV
    })
})

app.use('/api/v1', authRouter);
app.use('/api/v1', projectRouter);
app.use('/api', apiLimiter);
app.use('/api/v1/projects', aiLimiter);
app.use('/api/v1', orderRouter);

// 404 error handler
app.use((req: Request, res: Response) => {
    res.status(400).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    })
})

// Global Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack || err.message);
    res.status(500).json({
        success: false,
        message: config.NODE_ENV === "development" ? err.message : "Internal Server error"
    })
})

// error handler
app.use(errorHandler);

export {app};