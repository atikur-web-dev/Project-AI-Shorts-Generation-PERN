// Backend/src/routes/subscription.routes.ts
import { Router } from "express";

import {
  getAvailableSubscriptions,
} from "../controller/subscription.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/subscriptions",
  authenticate,
  getAvailableSubscriptions,
);

export const subscriptionRouter = router;