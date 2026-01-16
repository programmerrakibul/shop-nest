const express = require("express");
const {
  createOrder,
  getUserOrders,
} = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/verifyToken");

const orderRouter = express.Router();

orderRouter.use(verifyToken);

orderRouter.post("/", createOrder);

orderRouter.get("/customer", getUserOrders);

module.exports = orderRouter;
