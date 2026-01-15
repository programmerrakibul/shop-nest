const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send({ message: "Unauthorized access" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).send({ message: "Unauthorized access" });
    }

    const user = await User.findOne({
      email: decoded.email,
      "tokens.accessToken": token,
    });

    if (!user) {
      return res.status(401).send({ message: "Unauthorized access" });
    }

    req.user = {
      email: user.email,
      uid: user.uid,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
};

module.exports = { verifyToken };
