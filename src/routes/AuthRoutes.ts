import express from "express";
import AuthController from "../controllers/AuthController";
import { protect } from "../middleware/AuthMiddleware";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post('/register', asyncHandler(AuthController.register));

router.post('/login', asyncHandler(AuthController.login));

router.get('/confirmation/:token', asyncHandler(AuthController.confirmEmail));

router.post('/change-password', protect, asyncHandler(AuthController.changePassword));

export default router;