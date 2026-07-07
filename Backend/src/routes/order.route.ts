import { Router } from "express";
import { createOrderController } from "../controller/order.controller.js";
import {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
} from "../controller/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Order Creation
router.post("/orders", authenticate, createOrderController);

// Payment Routes
router.get("/ssl/:orderId", initiatePayment);
router.post("/payment/success", paymentSuccess);
router.post("/payment/fail", paymentFail);
router.post("/payment/cancel", paymentCancel);
router.post("/payment/ipn", paymentIPN);

export const orderRouter = router;
