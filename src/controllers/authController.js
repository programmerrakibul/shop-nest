const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateTokens } = require("../utils/generateTokens");
const uuid = require("uuid");

const registerUser = async (req, res) => {
  try {
    const uid = uuid.v4();
    const { name, email, password, image, role = "customer" } = req.body || {};

    // Validating required fields
    if (!name || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: name, email, password",
      });
    }

    // Validating password length
    if (password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Checking if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { uid }] });

    if (existingUser) {
      return res.status(400).send({
        message: "User already exists with this email or UID",
      });
    }

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // generating tokens
    const { accessToken, refreshToken } = generateTokens(email, uid, role);

    // Creating new user
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

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Validating required fields
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: email, password",
      });
    }

    // Finding user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Checking password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid credentials" });
    }

    // Generating new tokens
    const { accessToken, refreshToken } = generateTokens(
      user.email,
      user.uid,
      user.role
    );

    // Updating user tokens and last login
    user["tokens.accessToken"] = accessToken;
    user["tokens.refreshToken"] = refreshToken;
    user.lastLoggedIn = new Date().toISOString();

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    res.send({
      success: true,
      message: "Login successful",
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

module.exports = { registerUser, loginUser };
