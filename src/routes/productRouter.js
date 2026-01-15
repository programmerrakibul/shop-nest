const express = require("express");
const {
  createProduct,
  getAllProducts,
} = require("../controllers/productController");

const productRouter = express.Router();

productRouter.post("/", createProduct);

productRouter.get("/", getAllProducts);

module.exports = productRouter;
