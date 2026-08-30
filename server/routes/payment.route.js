import express from "express";
import {
  createOrder,
  verifyPayment,
  markPaymentFailed,
  getMyPayments,
} from "../controllers/payment.controller.js";
import checkAuth from "../middlewares/checkAuth.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", checkAuth, createOrder);
paymentRouter.post("/verify", checkAuth, verifyPayment);
paymentRouter.post("/failed", checkAuth, markPaymentFailed);
paymentRouter.get("/history", checkAuth, getMyPayments);

export default paymentRouter;
