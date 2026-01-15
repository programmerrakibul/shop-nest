const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
} = require("../controllers/productController");

const productRouter = express.Router();

productRouter.post("/", createProduct);

productRouter.get("/", getAllProducts);

productRouter.get("/:id", getProductById);

module.exports = productRouter;
