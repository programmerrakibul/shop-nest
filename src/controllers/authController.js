const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateTokens } = require("../utils/generateTokens");
const uuid = require("uuid");

const registerUser = async (req, res) => {
  try {
    const uid = uuid.v4();
    const { name, email, password, image, role = "customer" } = req.body || {};

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: name, email, password",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { uid }] });

    if (existingUser) {
      return res.status(400).send({
        message: "User already exists with this email or UID",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // generate tokens
    const { accessToken, refreshToken } = generateTokens(email, uid, role);

    // Create new user
    const newUser = new User({
      name,
      email,
      image,
      uid,
      role,
      password: hashedPassword,
      tokens: { accessToken, refreshToken },
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    res.send({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

module.exports = { registerUser };
