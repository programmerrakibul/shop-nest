const express = require("express");
const { createOrder } = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/verifyToken");

const orderRouter = express.Router();

orderRouter.use(verifyToken);

orderRouter.post("/", createOrder);

module.exports = orderRouter;
