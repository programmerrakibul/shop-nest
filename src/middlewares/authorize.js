const authorize = (...roles) => {
  return (req, res, next) => {
    if (roles.length === 0) {
      return res.status(403).send({
        message:
          "Access denied. You don't have permission to perform this action.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).send({
        message:
          "Access denied. You don't have permission to perform this action.",
      });
    }

    next();
  };
};

module.exports = { authorize };
