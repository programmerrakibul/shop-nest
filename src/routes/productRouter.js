const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
} = require("../controllers/productController");
const { verifyToken } = require("../middlewares/verifyToken");
const { authorize } = require("../middlewares/authorize");

const productRouter = express.Router();

productRouter.post("/", verifyToken, authorize("admin"), createProduct);

productRouter.get("/", getAllProducts);

productRouter.get("/:id", getProductById);

module.exports = productRouter;
