const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/verifyToken");

const authRouter = express.Router();

// Register new user
authRouter.post("/register", registerUser);

// Login user
authRouter.post("/login", loginUser);

// Login user
authRouter.post("/login", loginUser);

// Logout user
authRouter.post("/logout", verifyToken, logoutUser);

module.exports = authRouter;
