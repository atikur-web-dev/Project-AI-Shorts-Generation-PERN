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

    // 1. Normalize orderId string if it comes through as an array
    const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

    if (!orderIdStr) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID required" });
    }

    // 2. Fetch the corresponding order details from DB
    const order = await getOrderById(orderIdStr);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // 3. Prevent re-initiating an already paid order
    if (order.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Order already completed",
      });
    }

    // 4. Initialize SSLCommerz instance (instantiated cleanly with no args)
    const sslcz = initSSLCommerz();
    const paymentData = getPaymentData(order, req);

    // 5. Send transaction details to the gateway
    const apiResponse = await sslcz.init(paymentData);

    // 6. Safeguard extracting the Gateway Redirect URL
    const gatewayURL = Array.isArray(apiResponse.GatewayPageURL)
      ? apiResponse.GatewayPageURL[0]
      : apiResponse.GatewayPageURL;

    if (!gatewayURL) {
      throw new Error(
        "Payment gateway URL not found or missing from gateway response",
      );
    }

    // 7. Track the pending transaction state inside the DB
    await updateOrderStatus(orderIdStr, "pending", order.id);

    logger.info(`Redirecting User to gateway: ${gatewayURL}`);
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

// Payment Success (SECURED AGAINST SPOOFING)
export const paymentSuccess = async (req: Request, res: Response) => {
  try {
    const { tran_id, status, val_id } = req.body;

    logger.info(
      `Success webhook triggered for Order: ${tran_id}, Status: ${status}`,
    );

    if (!val_id) {
      logger.error(
        `Security Alert: Received success callback without val_id for transaction: ${tran_id}`,
      );
      return res.redirect(
        `${process.env.CLIENT_URL}/payment/fail?orderId=${tran_id}`,
      );
    }

    // CRITICAL SECURITY FIX: Validate request with SSLCommerz server before granting database changes
    const sslcz = initSSLCommerz();
    const validationResponse = await sslcz.validate({ val_id });

    if (
      validationResponse.status === "VALID" ||
      validationResponse.status === "VALIDATED"
    ) {
      // Safely complete the order via the atomic Prisma transaction service layer
      await completeOrder(tran_id, val_id);

      // Redirect user safely to frontend success screen
      return res.redirect(
        `${process.env.CLIENT_URL}/payment/success?orderId=${tran_id}`,
      );
    }

    // If validation fails on server check, mark as failed
    logger.error(
      `Validation failed with SSLCommerz server for transaction: ${tran_id}`,
    );
    await updateOrderStatus(tran_id, "failed");
    return res.redirect(
      `${process.env.CLIENT_URL}/payment/fail?orderId=${tran_id}`,
    );
  } catch (error) {
    logger.error("Payment success verification handler failed:", error);
    return res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
};

// Payment Fail
export const paymentFail = async (req: Request, res: Response) => {
  try {
    const { tran_id } = req.body;

    if (tran_id) {
      await updateOrderStatus(tran_id, "failed");
      logger.warn(`Payment failed tracking recorded for: ${tran_id}`);
    }

    return res.redirect(
      `${process.env.CLIENT_URL}/payment/fail?orderId=${tran_id || ""}`,
    );
  } catch (error) {
    logger.error("Payment fail handler processing error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Payment fail handler error" });
  }
};

// Payment Cancel
export const paymentCancel = async (req: Request, res: Response) => {
  try {
    const { tran_id } = req.body;

    if (tran_id) {
      await updateOrderStatus(tran_id, "failed");
      logger.warn(`Payment cancelled tracking recorded for: ${tran_id}`);
    }

    return res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
  } catch (error) {
    logger.error("Payment cancel handler processing error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Payment cancel handler error" });
  }
};

// IPN Handler (Instant Payment Notification - SECURED AGAINST SPOOFING)
export const paymentIPN = async (req: Request, res: Response) => {
  try {
    const { tran_id, val_id } = req.body;

    logger.info(`Secure IPN ping received for transaction: ${tran_id}`);

    if (!val_id) {
      logger.warn(
        `IPN ignored due to missing val_id for transaction: ${tran_id}`,
      );
      return res
        .status(400)
        .send("Missing val_id required for IPN verification");
    }

    // Validate the payment state via server-to-server connection
    const sslcz = initSSLCommerz();
    const validationResponse = await sslcz.validate({ val_id });

    if (
      validationResponse.status === "VALID" ||
      validationResponse.status === "VALIDATED"
    ) {
      await completeOrder(tran_id, val_id);
      return res.status(200).send("IPN processed successfully");
    }

    await updateOrderStatus(tran_id, "failed");
    return res.status(400).send("IPN signature verification failed");
  } catch (error) {
    logger.error("IPN async webhook verification handler failed:", error);
    return res
      .status(500)
      .json({ success: false, message: "IPN handler failed" });
  }
};
