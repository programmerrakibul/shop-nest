require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRouter = require("./routes/authRouter.js");
const productRouter = require("./routes/productRouter.js");

const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(express.json());

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");

    app.get("/", (req, res) => {
      res.send({ message: "Welcome to ShopNest Backend API" });
    });

    app.use("/api/auth", authRouter);
    app.use("/api/products", productRouter);

    // 404 handler
    app.use((req, res) => {
      res.status(404).send({ message: "API route not found" });
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } finally {
    //  await mongoose.disconnect();
  }
};

// Start the application
startServer().catch(console.dir);
