const express = require("express");
const asyncHandler = require('express-async-handler')
const { getGroupConversations, createGroupConversation, getGroupConversationsShort, accessPrivateChat, leaveGroupConversation} = require("../controllers/GroupConversationController");
const { protect } = require("../middleware/AuthMiddleware");

const router = express.Router();

router.get("/", protect, asyncHandler(getGroupConversations));

router.delete("/", protect, asyncHandler(leaveGroupConversation));

router.post("/direct", protect, asyncHandler(accessPrivateChat));

router.get("/short", protect, asyncHandler(getGroupConversationsShort));

router.post("/group", protect, asyncHandler(createGroupConversation));

module.exports = router;