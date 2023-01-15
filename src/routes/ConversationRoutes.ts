const express = require("express");
const asyncHandler = require('express-async-handler')
import ConversationController from "../controllers/ConversationController";
const { protect } = require("../middleware/AuthMiddleware");

const router = express.Router();

router.get("/", protect, asyncHandler(ConversationController.getGroupConversations));

router.delete("/", protect, asyncHandler(ConversationController.leaveGroupConversation));

router.post("/direct", protect, asyncHandler(ConversationController.accessPrivateConversation));

router.get("/short", protect, asyncHandler(ConversationController.getGroupConversationsShort));

router.post("/group", protect, asyncHandler(ConversationController.createGroupConversation));

module.exports = router;