const jwt = require("jsonwebtoken");

const generateTokens = (email, uid, role) => {
  const accessToken = jwt.sign({ email, uid, role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(
    { email, uid, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
