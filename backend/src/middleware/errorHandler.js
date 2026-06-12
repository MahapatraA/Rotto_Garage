const errorHandler = (err, req, res, next) => {
  console.error(`[ROTTO][ERROR] ${err.stack || err.message}`);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

const createError = (statusCode, code, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

module.exports = { errorHandler, createError };
