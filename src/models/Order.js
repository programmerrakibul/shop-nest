const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userInfo: {
      uid: {
        type: String,
        required: [true, "User ID is required"],
        trim: true,
        unique: true,
      },
      email: {
        type: String,
        required: [true, "User email is required"],
        trim: true,
        unique: true,
      },
    },
    orderID: {
      type: String,
      unique: true,
      required: [true, "Order ID is required"],
      trim: true,
    },
    product: {
      name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
      },
      productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"],
        trim: true,
        unique: true,
      },
      price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
        default: 0,
      },
      quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
        default: 1,
      },
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["pending", "processing", "shipped", "cancelled", "delivered"],
      default: "pending",
      lowercase: true,
      trim: true,
    },
    paymentStatus: {
      type: String,
      required: [true, "Payment status is required"],
      enum: ["pending", "paid", "failed", "cancelled", "processing"],
      default: "pending",
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
