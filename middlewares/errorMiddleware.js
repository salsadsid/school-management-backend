function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Include the stack trace in development mode for debugging
    // stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
}

export default errorHandler;
