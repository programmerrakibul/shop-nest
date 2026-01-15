const express = require("express");
const { registerUser } = require("../controllers/authController");

const authRouter = express.Router();

// Register new user
authRouter.post("/register", registerUser);

module.exports = authRouter;
