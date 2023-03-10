import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import path from "path";

const User = require('../models/User');


async function addContact(req: Request, res: Response) {
  const user: any = req.user;
  const contact = await User.findOne({ _id: req.body.userId });
  if (contact) {
    await User.updateOne(
      { _id: user._id },
      { $push: { contacts: contact._id } }
    );
    await User.updateOne(
      { _id: contact._id },
      { $push: { contacts: user._id } }
    );

    res.status(200).json({ message: "Contact added" });
  } else {
    res.status(400).json({ message: "Wrong email" });
  }
}


async function getMe(req: Request, res: Response) {
  const user: any = req.user;
  const profile = await User.findById(user._id).select("_id username email imageUri");
  res.status(200).json({
    id: profile._id,
    username: profile.username,
    email: profile.email,
    imageUri: profile.imageUri
  });
}

async function getContacts(req: Request, res: Response) {
  const user: any = req.user;
  const contactIds: mongoose.Types.ObjectId[] = user.contacts;
  const contacts = await User.find({ _id: { $in: contactIds } }).select("_id username imageUri");
  const formatedContacts = contacts.map((c: any) => ({
    id: c._id,
    username: c.username,
    imageUri: c.imageUri,
  }));
  console.log(formatedContacts);
  res.status(200).json(formatedContacts);
}

async function filterUsers(req: Request, res: Response) {
  const user: any = req.user;
  
  const userContacts = (await User.findById(user._id)).contacts;
  console.log(userContacts);
  const excluded = userContacts ? [user._id, ...userContacts] : [user._id];
  console.log(excluded)
  let users = await User.find({ _id: { $nin: excluded } }).select("username imageUri");
  users = users.map((user: any) => ({ id: user._id, username: user.username, imageUri: user.imageUri}));
  console.log(users);
  res.send(users);
}

async function changeUsername(req: Request, res: Response) {
  const user: any = req.user;
  const newUsername: string = req.body.newUsername;
  if ( newUsername ) {
    await User.updateOne(
      { _id: user._id },
      { username: newUsername } 
    );
    res.status(200).json({ message: "Contact added" });
  } else {
    res.status(400).json({ message: "Wrong email" });
  }
}

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


const saveAvaterPath = async (req: any, res: any) => {
    const file: any = req.file;
    console.log(typeof file)
    const user = req.user;
    if (file) {
        await User.updateAvatar(user._id, `${user._id}/${file.filename}`);
        return res.json({msg: "Avatar upladed"});
    }
    res.send("Image upload faild")
}

const uploadAvatar = multer({storage}).single("photo");


module.exports = {
  addContact,
  getContacts,
  getMe,
  filterUsers,
  changeUsername,
  uploadAvatar,
  saveAvaterPath
}