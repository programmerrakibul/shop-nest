require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connectDB.js");
const authRouter = require("./routes/authRouter.js");
const productRouter = require("./routes/productRouter.js");
const orderRouter = require("./routes/orderRouter.js");

const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(express.json());

const startServer = async () => {
  try {
    await connectDB();

    app.get("/", (req, res) => {
      res.send({ message: "Welcome to ShopNest Backend API" });
    });

    app.use("/api/auth", authRouter);
    app.use("/api/products", productRouter);
    app.use("/api/orders", orderRouter);

    // 404 handler
    app.use((req, res) => {
      res.status(404).send({ message: "API route not found" });
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.dir(error);
  }
};

startServer();
