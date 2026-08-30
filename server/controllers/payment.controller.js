import crypto from "node:crypto";
import mongoose, { isValidObjectId } from "mongoose";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";

const paymentPlans = {
  starter: { amount: 49, credits: 500 },
  pro: { amount: 99, credits: 1100 },
  premium: { amount: 199, credits: 2500 },
};

const getUser = async (userId) => {
  if (!userId || !isValidObjectId(userId)) return null;
  return User.findById(userId);
};

const createOrder = async (req, res) => {
  try {
    const user = await getUser(req.user_id);
    if (!user) return res.status(401).json({ message: "Invalid user" });

    const { planId } = req.body || {};
    const plan = paymentPlans[String(planId)]

    if (!plan) {
      return res.status(400).json({ message: "A valid payment plan is required" });
    }

    const amountInRupees = plan.amount;
    const creditAmount = plan.credits;
    const amountInPaise = Math.round(amountInRupees * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `hire-ready-${user._id}-${Date.now()}`,
      notes: { userId: String(user._id), planId: String(planId), credits: String(creditAmount) },
    });

    const payment = await Payment.create({
      userId: user._id,
      planId: String(planId),
      amount: amountInRupees,
      credits: creditAmount,
      orderId: order.id,
      status: "created",
    });

    return res.status(201).json({
      paymentId: payment._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      credits: payment.credits,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return res.status(500).json({ message: "Failed to create payment order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const user = await getUser(req.user_id);
    if (!user) return res.status(401).json({ message: "Invalid user" });

    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "Payment verification fields are required" });
    }

    const payment = await Payment.findOne({ orderId, userId: user._id });
    if (!payment) return res.status(404).json({ message: "Payment order not found" });
    if (payment.status === "paid") {
      return res.status(200).json({ message: "Payment already verified", credits: user.credits });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    const signaturesMatch = expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

    if (!signaturesMatch) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const razorpayPayment = await razorpay.payments.fetch(paymentId);
    if (razorpayPayment.order_id !== orderId || razorpayPayment.status !== "captured") {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ message: "Payment was not captured" });
    }

    const session = await mongoose.startSession();
    let updatedUser;
    try {
      await session.withTransaction(async () => {
        const paymentToUpdate = await Payment.findOneAndUpdate(
          { _id: payment._id, status: { $ne: "paid" } },
          { paymentId, status: "paid" },
          { new: true, session }
        );

        if (!paymentToUpdate) return;

        updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $inc: { credits: paymentToUpdate.credits } },
          { new: true, session }
        );
      });
    } finally {
      await session.endSession();
    }

    if (!updatedUser) {
      const latestUser = await User.findById(user._id);
      return res.status(200).json({ message: "Payment already verified", credits: latestUser?.credits ?? user.credits });
    }

    return res.status(200).json({
      message: "Payment verified successfully",
      credits: updatedUser.credits,
      paymentId,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
};

const markPaymentFailed = async (req, res) => {
  try {
    const user = await getUser(req.user_id);
    if (!user) return res.status(401).json({ message: "Invalid user" });

    const { orderId } = req.body || {};
    const payment = await Payment.findOneAndUpdate(
      { orderId, userId: user._id, status: { $ne: "paid" } },
      { status: "failed" },
      { new: true }
    );

    if (!payment) return res.status(404).json({ message: "Payment order not found" });
    return res.status(200).json({ message: "Payment marked as failed" });
  } catch (error) {
    console.error("Mark payment failed error:", error);
    return res.status(500).json({ message: "Failed to update payment status" });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const user = await getUser(req.user_id);
    if (!user) return res.status(401).json({ message: "Invalid user" });

    const payments = await Payment.find({ userId: user._id })
      .select("planId amount credits orderId paymentId status createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ payments });
  } catch (error) {
    console.error("Get payment history error:", error);
    return res.status(500).json({ message: "Failed to fetch payment history" });
  }
};

export { createOrder, verifyPayment, markPaymentFailed, getMyPayments };
