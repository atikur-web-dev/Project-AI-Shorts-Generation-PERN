// Backend/src/routes/admin.routes.ts
import { Router } from "express";
import {
  getDashboardStats,
  getAllOrders,
  updateUserRole,
  deleteUser,
  getAllUsers,
  updateOrderStatus,
} from "../controller/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// All Projected Admin Route
router.use(authenticate, isAdmin);

// Dashboard
router.get("/admin/stats", getDashboardStats);

// User Management
router.get("/admin/users", getAllUsers);
router.patch("/admin/users/:usersId/role", updateUserRole);
router.delete("/admin/users/:userId", deleteUser);

// Orders Management
router.get("/admin/orders", getAllOrders);
router.patch("/admin/orders/:orderId/status", updateOrderStatus);

export const adminRouter = router;
