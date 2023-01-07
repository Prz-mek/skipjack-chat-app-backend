import { Request, Response, NextFunction } from "express";
const asyncHandler = require('express-async-handler');
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            let token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
            req.user = await User.findById(decoded.id).select("-hash");
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized: " + error);
        }
    } else  {
        res.status(401)
        throw new Error("Not authorized, no token");
    }
});

export { protect };