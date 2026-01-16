const jwt = require("jsonwebtoken");
const { appError } = require("../utils/appError");

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || !jwtSecret.trim()) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw appError("Access token is required", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, jwtSecret);

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        success: false,
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return next(appError("Invalid access token", 401));
    }

    next(error);
  }
};

module.exports = { verifyToken };
