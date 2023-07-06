const express = require("express");
const app = express();
const cors = require("cors");
const globalErrorHandler = require("./controllers/error");
const messageRouter = require("./routes/message");
const AppError = require("./utils/AppError");

// Middlewares
// CORS for allowing to connect to a frontend with address: http://localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  })
);

// For accepting JSON from the request body
app.use(express.json());

// Using the Items Router
app.use("/api/queue", messageRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
