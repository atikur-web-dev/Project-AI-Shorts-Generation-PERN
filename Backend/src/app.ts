import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import { authRouter } from './routes/auth.route.js';
import { orderRouter } from "./routes/order.route.js";
import { projectRouter } from './routes/project.route.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter, aiLimiter, authLimiter } from './middleware/rateLimiter.js';
import Express, { type Application, type Request, type Response } from "express";

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

// Routes & Rate Limiters
app.use('/api/v1', authRouter);
app.use('/api/v1', projectRouter);
app.use('/api', apiLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/projects', aiLimiter);
app.use('/api/v1', orderRouter);

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    })
})

app.use(errorHandler);

export { app };
