import { Request, Response, NextFunction } from "express";


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const SALT_ROUNDS = 10;
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const EMAIL_SECRET = process.env.EMAIL_SECRET;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;


export default class AuthController {

  private static generateEmailToken(id: string) {
    return jwt.sign({ "id": id }, EMAIL_SECRET, { expiresIn: "5d" });
  }

  private static generateAccessToken(id: any, username: string) {
    return jwt.sign({ "id": id, "username": username }, ACCESS_SECRET, { expiresIn: "100d" });
  }
  
  private static generateRefreshToken(id: any, username: string) {
    return jwt.sign({ "id": id, "username": username }, REFRESH_SECRET, { expiresIn: "600d" });
  }
  
  public static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (user && (await bcrypt.compare(password, user.hash))) {
      console.log({
        id: user._id,
        username: user.username,
        email: user.email,
        accessToken: AuthController.generateAccessToken(user._id, user.username),
        refreashToken: AuthController.generateRefreshToken(user._id, user.username),
      });
      res.status(201).json({
        id: user._id,
        username: user.username,
        email: user.email,
        accessToken: AuthController.generateAccessToken(user._id, user.username),
        refreashToken: AuthController.generateRefreshToken(user._id, user.username),
      });
    } else {
      res.status(400)
      throw new Error("Invalid credentials");
    }
  }
  
  public static async refreshToken(req: Request, res: Response) {
    const refreashToken = req.body.token;
    const user: any = req.user;
  
    if (!refreashToken) {
      return res.status(401);
    }
  
    try {
      await jwt.verify(refreashToken, REFRESH_SECRET);
    } catch (err) {
      return res.sendStatus(403);
    }
    
    const accessToken = AuthController.generateAccessToken(user._id, user.username);
    res.status(200).json(accessToken);
  }

  public static async confirmEmail(req: Request, res: Response) {
    try {
      console.log(req.params.token);
      const decoded = jwt.verify(req.params.token, EMAIL_SECRET);
      console.log(decoded);
      await User.update({ confirmed: true }, { where: { _id : decoded.id } });
    } catch (e) {
      res.send('error');
    }
  };

  public static async register(req: Request, res: Response) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400);
      throw new Error("Please fill all fields");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error(`User with email: ${email} already exists`);
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: username,
      email: email,
      hash: hashedPassword,
      confirmed: false,
      contacts: []
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }

    const emailToken = AuthController.generateEmailToken(user._id);
    const url = `http://localhost:5000/confirmation/${emailToken}`;

    const output = `
      <h3>Confirmation email</h3>
      Please click this email to confirm your email: <a href="${url}">${url}</a>
    `;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_ADDRESS,
        pass: EMAIL_PASSWORD,
      }
    });
    
    let mailOptions = {
      from: `"Chat App" ${EMAIL_ADDRESS}`,
      to: email, // list of receivers
      subject: 'Node Contact Request',
      html: output
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      console.log(typeof error);
      console.log(typeof info);
      if (error) {
        console.log(error);
        res.json({ msg: 'Error' });
      }

      res.json({ msg: 'Email has been sent' });
    });
  }

  public static async changePassword(req: Request, res: Response) {
    const user: any = req.user;
    const{ password, newPassword } = req.body
    const hash = await User.findOne({ _id: user._id }).select("hash").hash;
    
    if (await bcrypt.compare(password, user.hash)) {
      res.status(400)
      throw new Error("Invalid credentials");
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const newHash = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { _id: user._id },
      { hash:  newHash }
    );
  }
}