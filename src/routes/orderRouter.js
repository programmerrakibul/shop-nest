const express = require("express");
const {
  createOrder,
  getUserOrders,
  getAllOrders,
} = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/verifyToken");
const { authorize } = require("../middlewares/authorize");

const orderRouter = express.Router();

orderRouter.use(verifyToken);

orderRouter.post("/", createOrder);

orderRouter.get("/", authorize("admin"), getAllOrders);

orderRouter.get("/customer", getUserOrders);

module.exports = orderRouter;
