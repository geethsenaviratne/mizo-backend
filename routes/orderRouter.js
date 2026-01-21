import express from 'express';
import { createOrder, getOrders, getQuote, updateOrderStatus } from '../controllers/orderController.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const orderRouter = express.Router();

orderRouter.post("/", createOrder)
orderRouter.get("/", getOrders)
orderRouter.post("/quote", getQuote)
orderRouter.put("/:orderId", updateOrderStatus)

export default orderRouter;

