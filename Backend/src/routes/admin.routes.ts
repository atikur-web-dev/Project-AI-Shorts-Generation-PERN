// Backend/src/routes/admin.routes.ts
import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

// Dashboard
import {
  getDashboardStats,
  getDashboardSummary,
  getTimeSeriesStats,
} from "../controller/admin/dashboard.controller.js";

// Users
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  searchUsers,
  getUsersCursor,
} from "../controller/admin/user.controller.js";

// Orders
import {
  getAllOrders,
  updateOrderStatus,
} from "../controller/admin/order.controller.js";

// Subscriptions
import {
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../controller/admin/subscription.controller.js";

// Projects
import {
  getAllProjects,
  getProjectById,
  deleteProject,
  getProjectAnalytics,
} from "../controller/admin/project.controller.js";

// Reports
import {
  getRevenueReport,
  getUserActivityReport,
  getProjectAnalytics as getReportProjectAnalytics,
  exportReport,
} from "../controller/admin/report.controller.js";

// Logs
import {
  getAdminLogs,
  searchUsersBasic,
  getSearchHistoryController,
  clearSearchHistoryController,
} from "../controller/admin/log.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Admin Authentication & Authorization
|--------------------------------------------------------------------------
|
| Every route in this router requires:
|
| 1. A valid JWT access token
| 2. An authenticated user
| 3. ADMIN role
|
*/

router.use(authenticate);
router.use(isAdmin);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

/**
 * GET /api/v1/admin/dashboard
 */
router.get("/dashboard", getDashboardSummary);

/**
 * GET /api/v1/admin/stats
 */
router.get("/stats", getDashboardStats);

/**
 * GET /api/v1/admin/stats/timeseries
 *
 * Query:
 * ?period=daily
 * ?period=weekly
 * ?period=monthly
 */
router.get(
  "/stats/timeseries",
  getTimeSeriesStats,
);

/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

/**
 * GET /api/v1/admin/users
 */
router.get("/users", getAllUsers);

/**
 * GET /api/v1/admin/users/search
 */
router.get(
  "/users/search",
  searchUsers,
);

/**
 * GET /api/v1/admin/users/basic-search
 */
router.get(
  "/users/basic-search",
  searchUsersBasic,
);

/**
 * GET /api/v1/admin/users/cursor
 */
router.get(
  "/users/cursor",
  getUsersCursor,
);

/**
 * PATCH /api/v1/admin/users/:userId/role
 */
router.patch(
  "/users/:userId/role",
  updateUserRole,
);

/**
 * DELETE /api/v1/admin/users/:userId
 */
router.delete(
  "/users/:userId",
  deleteUser,
);

/*
|--------------------------------------------------------------------------
| Orders
|--------------------------------------------------------------------------
*/

/**
 * GET /api/v1/admin/orders
 */
router.get(
  "/orders",
  getAllOrders,
);

/**
 * PATCH /api/v1/admin/orders/:orderId/status
 */
router.patch(
  "/orders/:orderId/status",
  updateOrderStatus,
);

/*
|--------------------------------------------------------------------------
| Subscriptions
|--------------------------------------------------------------------------
*/

/**
 * GET /api/v1/admin/subscriptions
 */
router.get(
  "/subscriptions",
  getAllSubscriptions,
);

/**
 * POST /api/v1/admin/subscriptions
 */
router.post(
  "/subscriptions",
  createSubscription,
);

/**
 * PATCH /api/v1/admin/subscriptions/:subscriptionId
 */
router.patch(
  "/subscriptions/:subscriptionId",
  updateSubscription,
);

/**
 * DELETE /api/v1/admin/subscriptions/:subscriptionId
 */
router.delete(
  "/subscriptions/:subscriptionId",
  deleteSubscription,
);

/*
|--------------------------------------------------------------------------
| Projects
|--------------------------------------------------------------------------
*/

/**
 * GET /api/v1/admin/projects
 */
router.get(
  "/projects",
  getAllProjects,
);

/**
 * GET /api/v1/admin/projects/analytics
 */
router.get(
  "/projects/analytics",
  getProjectAnalytics,
);

/**
 * GET /api/v1/admin/projects/:projectId
 */
router.get(
  "/projects/:projectId",
  getProjectById,
);

/**
 * DELETE /api/v1/admin/projects/:projectId
 */
router.delete(
  "/projects/:projectId",
  deleteProject,
);

/*
|--------------------------------------------------------------------------
| Reports
|--------------------------------------------------------------------------
*/

/**
 * GET /api/v1/admin/reports/revenue
 */
router.get(
  "/reports/revenue",
  getRevenueReport,
);

/**
 * GET /api/v1/admin/reports/users
 */
router.get(
  "/reports/users",
  getUserActivityReport,
);

/**
 * GET /api/v1/admin/reports/projects
 */
router.get(
  "/reports/projects",
  getReportProjectAnalytics,
);

/**
 * GET /api/v1/admin/reports/export
 */
router.get(
  "/reports/export",
  exportReport,
);

/*
|--------------------------------------------------------------------------
| Admin Logs
|--------------------------------------------------------------------------
*/

/**
 * GET /api/v1/admin/logs
 */
router.get(
  "/logs",
  getAdminLogs,
);

/*
|--------------------------------------------------------------------------
| Search History
|--------------------------------------------------------------------------
*/

/**
 * GET /api/v1/admin/search/history
 */
router.get(
  "/search/history",
  getSearchHistoryController,
);

/**
 * DELETE /api/v1/admin/search/history
 */
router.delete(
  "/search/history",
  clearSearchHistoryController,
);

export const adminRouter = router;