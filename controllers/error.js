require("dotenv").config();
const AppError = require("../utils/appError");

// When NODE_ENV=development send all the details of that error
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// When NODE_ENV=production send only the message and the status
const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

// Handle Each error differently
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    console.log("Logging the error", err);
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      error = new AppError(error.errors[0].message, 400);
      sendErrorProd(error, res);
    } else {
      console.log("Logging the error", err);
      sendErrorProd(err, res);
    }
  }
};
