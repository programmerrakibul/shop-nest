const uuid = require("uuid");
const stripe = require("../config/stripe");
const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { productID, quantity } = req.body;

    if (!productID || productID.trim().length !== 24) {
      return res.status(400).send({
        success: false,
        message: "Product information is required",
      });
    }

    let existingProduct;

    try {
      existingProduct = await Product.findById(productID);

      if (!existingProduct) {
        return res.status(404).send({
          success: false,
          message: "Product not found",
        });
      }
    } catch (error) {
      return res.status(400).send({
        success: false,
        message: "Invalid product ID",
      });
    }

    const productName = existingProduct.name;
    const productPrice = existingProduct.price;
    const quantityNum = Number(quantity) || 1;
    const orderID = `ORD-${uuid.v4().split("-").join("").substring(0, 12)}`;

    if (quantityNum > existingProduct.quantity) {
      return res.status(400).send({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            unit_amount: productPrice * quantityNum * 100,
            currency: "usd",
            product_data: {
              name: productName,
              description: existingProduct.description.substring(0, 100),
            },
          },
          quantity: quantityNum,
        },
      ],
      customer_email: email,
      metadata: {
        productID,
        orderID,
      },
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/order-cancel`,
    });

    const newOrder = new Order({
      userInfo: {
        uid,
        email,
      },
      orderID,
      product: {
        name: productName,
        productID: productID,
        price: productPrice,
        quantity: quantityNum,
      },
    });

    const savedOrder = await newOrder.save();

    res.send({
      success: true,
      message: "Order created successfully. Proceed to payment.",
      order: {
        ...savedOrder.toObject(),
      },
      stripeSessionId: session.id,
      stripeCheckoutUrl: session.url,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    res.status(500).send({
      success: false,
      message: "Server error while creating order",
      error: error.message,
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { uid, email } = req.user;

    const orders = await Order.find({
      "userInfo.uid": uid,
      "userInfo.email": email,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.send({
      success: true,
      message: "User orders retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);

    res.status(500).send({
      success: false,
      message: `Error retrieving orders: ${error.message}`,
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { limit, skip } = req.query;

    const limitNum = parseInt(limit) || 0;
    const skipNum = parseInt(skip) || 0;

    const orders = await Order.find()
      .skip(skipNum)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .lean();

    res.send({
      success: true,
      message: "All orders retrieved successfully",
      orders,
      total: orders.length || 0,
    });
  } catch (error) {
    console.error("Error retrieving orders:", error);

    res.status(500).send({
      success: false,
      message: `Error retrieving orders: ${error.message}`,
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
};
