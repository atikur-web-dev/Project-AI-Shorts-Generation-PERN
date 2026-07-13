// Backend/src/routes/admin.routes.ts
import { Router } from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getRevenueReport,          
  getUserActivityReport,     
  getProjectAnalytics,       
  exportReport,              
  getTimeSeriesStats,
  getDashboardSummary,
  getAdminLogs,
  searchUsers,
} from '../controller/admin.controller.js';
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
router.get('/admin/users/search', searchUsers);

// Orders Management
router.get("/admin/orders", getAllOrders);
router.patch("/admin/orders/:orderId/status", updateOrderStatus);

// admin logs
router.get('/admin/logs', getAdminLogs);

// ============ Reports ============
router.get('/admin/reports/revenue', getRevenueReport);
router.get('/admin/reports/users', getUserActivityReport);
router.get('/admin/reports/projects', getProjectAnalytics);
router.get('/admin/reports/export', exportReport);
router.get('/admin/dashboard', getDashboardSummary);


export const adminRouter = router;
