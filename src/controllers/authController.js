const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateTokens } = require("../utils/generateTokens");
const { appError } = require("../utils/appError");
const { generateUID } = require("../utils/generateUID");

const registerUser = async (req, res, next) => {
  try {
    const uid = generateUID();
    const { name, email, password, image, role = "customer" } = req.body || {};

    // Validating required fields
    if (
      !name ||
      !name.trim() ||
      !email ||
      !email.trim() ||
      !password ||
      !password.trim()
    ) {
      throw appError("Missing required fields: name, email, password", 400);
    }

    // Validating password length
    if (password.length < 6) {
      throw appError("Password must be at least 6 characters long", 400);
    }

    // Checking if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { uid }] });

    if (existingUser) {
      throw appError("User already exists with this email or UID", 400);
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
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // Validating required fields
    if (!email || !email.trim() || !password || !password.trim()) {
      throw appError("Missing required fields: email, password", 400);
    }

    // Finding user by email
    const user = (await User.findOne({ email })).toObject();

    if (!user) {
      throw appError("User not found", 404);
    }

    // Checking password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw appError("Invalid credentials", 401);
    }

    // Generating new tokens
    const { accessToken, refreshToken } = generateTokens(
      user.email,
      user.uid,
      user.role,
    );

    // Updating user tokens and last login
    await User.findByIdAndUpdate(user._id, {
      $set: {
        "tokens.accessToken": accessToken,
        "tokens.refreshToken": refreshToken,
        lastLoggedIn: new Date().toISOString(),
      },
    });

    delete user.password;
    delete user.tokens;

    res.send({
      success: true,
      message: "Login successful",
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const { email } = req.user;

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          "tokens.accessToken": null,
          "tokens.refreshToken": null,
        },
      },
    );

    res.send({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const refreshTokens = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshToken.trim()) {
      throw appError("Refresh token is required", 400);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findOne({
      email: decoded.email,
      uid: decoded.uid,
      "tokens.refreshToken": refreshToken,
    });

    if (!user) {
      throw appError("Invalid refresh token", 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.email,
      user.uid,
      user.role,
    );

    await User.findByIdAndUpdate(user._id, {
      $set: {
        "tokens.accessToken": accessToken,
        "tokens.refreshToken": newRefreshToken,
      },
    });

    res.send({
      success: true,
      message: "Tokens refreshed successfully",
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(appError("Invalid or expired refresh token", 401));
    }
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const { email, uid } = req.user;

    const user = await User.findOne({ email, uid }).lean();

    if (!user) {
      throw appError("User not found", 404);
    }

    delete user.password;
    delete user.tokens;

    res.send({
      success: true,
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokens,
  getUserProfile,
};
