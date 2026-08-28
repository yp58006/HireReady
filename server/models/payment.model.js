import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: String, required: true },
  amount: { type: Number, required: true },
  credits: { type: Number, required: true },
  orderId: { type: String, required: true },
  paymentId: { type: String },
  status: {
    type: String,
    enum: ["created", "pending", "paid", "failed", "cancelled"],
    default: "pending",
  },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
