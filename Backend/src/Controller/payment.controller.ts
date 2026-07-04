// Backend/src/controller/payment.controller.ts
import type { Request, Response } from "express";
import { initSSLCommerz, getPaymentData } from "../lib/sslCommerz.js";
import {
  getOrderById,
  updateOrderStatus,
  completeOrder,
} from "../services/order.service.js";
import { logger } from "../config/logger.js";

// Initiate Payment
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId || Array.isArray(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID required" });
    }

    // 1. Get order
    const order = await getOrderById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 2. Check if already completed
    if (order.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Order already completed",
      });
    }

    // 3. Prepare payment data
    const sslcz = initSSLCommerz();
    const paymentData = getPaymentData(order, req);

    // 4. Initiate payment
    const apiResponse = await sslcz.init(paymentData);

    // 5. Get gateway URL
    const gatewayURL = Array.isArray(apiResponse.GatewayPageURL)
      ? apiResponse.GatewayPageURL[0]
      : apiResponse.GatewayPageURL;

    if (!gatewayURL) {
      throw new Error("Payment gateway URL not found");
    }

    // 6. Update order with transaction ID
    await updateOrderStatus(orderId, "pending", order.id);

    logger.info(`Redirecting to payment: ${gatewayURL}`);
    return res.redirect(gatewayURL);
  } catch (error) {
    logger.error("Payment initiation failed:", error);
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Payment initiation failed",
    });
  }
};

// Payment Success
export const paymentSuccess = async (req: Request, res: Response) => {
  try {
    const { tran_id, status, val_id } = req.body;
    logger.info(`Payment Success : ${tran_id}, Status : ${status}`);
    if (status === "VALID" || status === "VALIDATE") {
      // complete order
      await completeOrder(tran_id, val_id || tran_id);

      // Redirect to frontend success Page
      return res.redirect(
        `${process.env.CLIENT_URL}/payment/success?orderId=${tran_id}`,
      );
    }

    // if Validation failed
    await updateOrderStatus(tran_id, "failed");
    return res.redirect(
      `${process.env.CLIENT_URL}/payment/fail?orderId=${tran_id}`,
    );
  } catch (error) {
    logger.error(`Payment success handler failed :`, error);
    return res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
};
