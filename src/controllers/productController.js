const Product = require("../models/Product");
const { appError } = require("../utils/appError");

const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.send({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
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
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length !== 24) {
      throw appError("Invalid product ID", 400);
    }

    const product = await Product.findById(id);

    if (!product) {
      throw appError("Product not found", 404);
    }
    res.send({
      success: true,
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProduct, getAllProducts, getProductById };
