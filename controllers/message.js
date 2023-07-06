const { Op, Sequelize, UUIDV4 } = require("sequelize");
const { message: Message } = require("../models/index");
const sequelize = require("sequelize");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Redis = require("redis");
const { v4 } = require("uuid");

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redisClient
  .connect()
  .then((conn) => console.log("Redis client connected!"))
  .catch((err) => console.log(err));

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

// PUSH
exports.addMessage = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  if (!message)
    return next(new AppError("Please fill all the required fields!", 400));

  if (Object.keys(req.body).length !== 1)
    return next(new AppError("Invalid parameters!", 404));

  await Message.create({
    id: v4(),
    message,
  });

  const availableMessages = await Message.findAll({});

  await redisClient.setEx("messages", 3600, JSON.stringify(availableMessages));

  res.status(201).json({
    message,
  });
});

exports.getAllAvailableMessages = catchAsync(async (req, res, next) => {
  const messagesInRedis = await redisClient.get("messages");
  if (messagesInRedis !== null) {
    console.log(messagesInRedis);
    const messages = JSON.parse(messagesInRedis);
    messages.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0));
    return res.json(messages);
  }

  const newMessages = await Item.findAll({});
  if (!newMessages.length)
    return res.status(200).json({
      message: "There are no available messages!",
    });
  await redisClient.setEx("messages", 3600, JSON.stringify(newMessages));
  process.on("SIGINT", function () {
    redisClient.quit();
    process.exit();
  });
  res.status(200).json(newMessages);
});

exports.getCount = catchAsync(async (req, res, next) => {});
