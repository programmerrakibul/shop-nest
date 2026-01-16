const appError = (message = "Bad Request", statusCode = 400, errors = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (errors) {
    error.errors = errors;
  }

  return error;
};

module.exports = { appError };
