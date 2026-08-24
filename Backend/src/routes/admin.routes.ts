import { Router } from "express";

import {
  getDashboardStats,
  getDashboardSummary,
  getTimeSeriesStats,
} from "../controller/admin/dashboard.controller.js";
import {
  getAllSubscriptions,
  updateSubscription,
} from "../controller/admin/subscription.controller.js";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  searchUsers,
  getUsersCursor,
} from "../controller/admin/user.controller.js";

import {
  getAllOrders,
  updateOrderStatus,
} from "../controller/admin/order.controller.js";
import {
  createSubscription,
} from "../controller/admin/subscription.controller.js";
import {
  getRevenueReport,
  getUserActivityReport,
  getProjectAnalytics as getReportProjectAnalytics,
  exportReport,
} from "../controller/admin/report.controller.js";

import {
  getAdminLogs,
  getSearchHistoryController,
  clearSearchHistoryController,
} from "../controller/admin/log.controller.js";

import {
  getAllProjects,
  getProjectById,
  deleteProject,
  getProjectAnalytics,
} from "../controller/admin/project.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.use(authenticate, isAdmin);

router.get("/admin/stats", getDashboardStats);
router.get("/admin/dashboard", getDashboardSummary);
router.get("/admin/stats/timeseries", getTimeSeriesStats);

router.get("/admin/users", getAllUsers);
router.patch("/admin/users/:userId/role", updateUserRole);
router.delete("/admin/users/:userId", deleteUser);
router.get("/admin/users/search", searchUsers);
router.get("/admin/users/cursor", getUsersCursor);

router.get("/admin/orders", getAllOrders);
router.patch("/admin/orders/:orderId/status", updateOrderStatus);
router.get(
  "/admin/subscriptions",
  getAllSubscriptions,
);
router.post(
  "/admin/subscriptions",
  createSubscription,
);
router.patch(
  "/admin/subscriptions/:subscriptionId",
  updateSubscription,
);
router.get("/admin/projects", getAllProjects);
router.get("/admin/projects/analytics", getProjectAnalytics);
router.get("/admin/projects/:projectId", getProjectById);
router.delete("/admin/projects/:projectId", deleteProject);

router.get("/admin/logs", getAdminLogs);

router.get("/admin/reports/revenue", getRevenueReport);
router.get("/admin/reports/users", getUserActivityReport);
router.get("/admin/reports/projects", getReportProjectAnalytics);
router.get("/admin/reports/export", exportReport);

router.get(
  "/admin/search/history",
  getSearchHistoryController,
);

router.delete(
  "/admin/search/history",
  clearSearchHistoryController,
);

export const adminRouter = router;