const jwt = require("jsonwebtoken");

const accessTokenSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

if (!accessTokenSecret || !accessTokenSecret.trim()) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

if (!refreshTokenSecret || !refreshTokenSecret.trim()) {
  throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
}

const generateTokens = (email, uid, role) => {
  const accessToken = jwt.sign({ email, uid, role }, accessTokenSecret, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ email, uid, role }, refreshTokenSecret, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
