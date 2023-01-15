import express from "express";
const asyncHandler = require('express-async-handler')
const { getContacts, getMe, addContact, filterUsers, changeUsername, uploadAvatar, saveAvaterPath } = require("../controllers/UserController");
const { protect } = require("../middleware/AuthMiddleware");

const router = express.Router();

router.get("/me", protect, asyncHandler(getMe));

router.put("/filter", protect, asyncHandler(filterUsers));

router.get("/contacts", protect, asyncHandler(getContacts));

router.put("/contacts", protect, asyncHandler(addContact));

router.put("/username", protect, asyncHandler(changeUsername));

router.post("/avatar", protect, uploadAvatar, asyncHandler(saveAvaterPath));


module.exports = router;