import { Router } from 'express';
import { createOrderController } from '../controller/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/orders', authenticate, createOrderController);

export const orderRouter = router;