const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  date: { type: Date, required: true },
  address: String,
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  // Payment related fields
  paymentStatus: {
    type: String,
    enum: ["unpaid", "pending", "paid", "failed", "refunded"],
    default: "unpaid",
  },
  paymentId: String, // Razorpay payment ID
  paymentOrderId: String, // Razorpay order ID
  paidAt: Date,
  paymentError: String,
  // Refund related fields
  refundId: String, // Razorpay refund ID
  refundAmount: Number,
  refundReason: String,
  refundedAt: Date,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Booking", BookingSchema);
