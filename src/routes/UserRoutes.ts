import express from "express";
import fs from "fs";
const User = require('../models/User');
const asyncHandler = require('express-async-handler')
const path = require("path")
const { getContacts, getMe, addContact, filterUsers, changeUsername } = require("../controllers/UserController");
const { protect } = require("../middleware/AuthMiddleware");

// MULTER
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        const user = req.user;
        const dirName = `${path.resolve(__dirname, "../..")}/files/${user._id}`;
        fs.mkdirSync(dirName, { recursive: true });
        cb(null, dirName);
    },
    filename: (req: any, file: any, cb: any) => {
        const fileName = `avatar${path.extname(file.originalname)}`
        cb(null, fileName)
    }
});

const uploadAvatar = multer({storage}).single("photo");

const router = express.Router();

router.get("/me", protect, asyncHandler(getMe));

router.put("/filter", protect, asyncHandler(filterUsers));

router.get("/contacts", protect, asyncHandler(getContacts));

router.put("/contacts", protect, asyncHandler(addContact));

router.put("/username", protect, asyncHandler(changeUsername));

router.post("/avatar", protect, uploadAvatar, async (req: any, res: any) => {
    const file: any = req.file;
    const user = req.user;
    console.log(file);
    if (file) {
        await User.findOneAndUpdate({_id: user._id}, { imageUri: `${user._id}/${file.filename}` });
        return res.json({msg: "Avatar upladed"});
    }
    res.send("Image upload faild")
});


module.exports = router;