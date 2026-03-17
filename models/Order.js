import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, default: null },

    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      isJamiaStudent: { type: Boolean, required: true },
      timeSlot: { type: String, default: "" },
    },

    items: [
      {
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        description: { type: String, default: "" },
        category: { type: String, default: "stationery" },
      },
    ],

    category: { type: String, default: "stationery" },
    totalAmount: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },

    // Payment
    paymentMethod: { type: String, default: "upi" }, // upi | cod | razorpay
    paymentStatus: {
      type: String,
      enum: ["pending", "pending_verification", "paid", "failed"],
      default: "pending_verification",
    },
    utrNumber: { type: String, default: null }, // UTR / Transaction ID from UPI payment
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },

    // Live Tracking
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
    trackingUpdates: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
        location: { lat: Number, lng: Number },
      },
    ],
    deliveryLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    estimatedDelivery: { type: Date, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
