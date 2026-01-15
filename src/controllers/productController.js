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

const getAllProducts = async (req, res) => {
  try {
    const {
      limit = 10,
      skip = 0,
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const limitNum = parseInt(limit) || 10;
    const skipNum = parseInt(skip) || 0;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skipNum)
      .limit(limitNum);

    res.send({
      success: true,
      message: "Products retrieved successfully",
      products,
      total: products.length || 0,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);

    res.status(500).send({
      success: false,
      message: "Error retrieving products",
      error: error.message,
    });
  }
};

module.exports = { createProduct, getAllProducts };
