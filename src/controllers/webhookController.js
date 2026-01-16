const stripe = require("../config/stripe");
const Order = require("../models/Order");
const Product = require("../models/Product");

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret || !webhookSecret.trim()) {
  throw new Error(
    "STRIPE_WEBHOOK_SECRET is not defined in environment variables"
  );
}

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = webhookSecret;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    const session = event.data.object;

    switch (event.type) {
      case "checkout.session.completed":
        await handlePaymentSucceeded(session);
        break;

      case "checkout.session.expired":
        await handleCheckoutSessionExpired(session);
        break;

      case "checkout.session.async_payment_failed":
        await handlePaymentFailed(session);
        break;

      case "checkout.session.async_payment_succeeded":
        await handlePaymentSucceeded(session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.send({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);

    res.status(500).send({
      success: false,
      error: "Webhook handler failed",
      message: error.message,
    });
  }
};

const handlePaymentSucceeded = async (session) => {
  try {
    const { orderID, productID } = session.metadata;

    const order = await Order.findOne({ orderID });

    if (!order) {
      throw new Error(`Order ${orderID} not found`);
    }

    order.paymentStatus = "paid";
    order.status = "processing";

    await order.save();

    const product = await Product.findById(productID);

    if (!product) {
      throw new Error(`Product ${productID} not found`);
    }

    if (product.quantity < order.product.quantity) {
      throw new Error(`Insufficient stock for product ${productID}`);
    }

    product.quantity -= order.product.quantity;
    await product.save();
  } catch (error) {
    throw error;
  }
};

const handleCheckoutSessionExpired = async (session) => {
  try {
    const { orderID } = session.metadata;

    const order = await Order.findOne({ orderID });

    if (order && order.paymentStatus === "pending") {
      order.paymentStatus = "cancelled";
      order.status = "cancelled";

      await order.save();
    }
  } catch (error) {
    throw error;
  }
};

const handlePaymentFailed = async (session) => {
  try {
    const { orderID } = session.metadata;

    const order = await Order.findOne({ orderID });

    if (order && order.paymentStatus === "pending") {
      order.paymentStatus = "failed";
      await order.save();
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  stripeWebhook,
};
