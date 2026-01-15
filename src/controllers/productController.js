const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.send({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    res.status(500).send({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

module.exports = { createProduct };
