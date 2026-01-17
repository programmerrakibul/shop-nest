const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokens,
  getUserProfile,
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

// Refresh tokens
authRouter.post("/refresh", refreshTokens);

authRouter.get("/profile", verifyToken, getUserProfile);

module.exports = authRouter;
