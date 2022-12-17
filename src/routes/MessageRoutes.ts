import express from "express";

const asyncHandler = require('express-async-handler')
const { getMessages, createMessage, deleteMessage } = require("../controllers/MessageController");
const { protect } = require("../middleware/AuthMiddleware");

const router = express.Router();

router.put("/", protect, asyncHandler(getMessages));

router.post("/", protect, asyncHandler(createMessage));

router.delete("/:id", protect, asyncHandler(deleteMessage));

module.exports = router;